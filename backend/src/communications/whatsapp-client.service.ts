import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import P from 'pino';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

const qrcode = require('qrcode-terminal');

export type WaSessionStatus =
  | 'CONNECTING'
  | 'QR'
  | 'CONNECTED'
  | 'DISCONNECTED'
  | 'LOGGED_OUT';

export interface WaSession {
  socket: any;
  status: WaSessionStatus;
  qr?: string;
  connectedName?: string;
  retryCount: number;
}

// ──────────────────────────────────────────────────────────────
// WhatsAppClientService
// Patterns borrowed from:
//   - Baileys (Example/example.ts)                   → socket setup, event handling
//   - Super-Light-Web-WhatsApp-API-Server (whatsapp.js) → multi-session, retry logic, version fallback
//   - WPPConnect-server (messageController.ts)       → sendFile, sendLocation, bulk-send
// ──────────────────────────────────────────────────────────────
@Injectable()
export class WhatsAppClientService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WhatsAppClientService.name);

  // Multi-session support (stolen from Super-Light-Web-WhatsApp-API-Server)
  private sessions = new Map<string, WaSession>();
  private readonly AUTH_DIR = path.join(process.cwd(), 'wa_auth');
  private readonly DEFAULT_SESSION = 'default';

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    this.ensureAuthDir();
    // Use a small delay to ensure NestJS has finished its internal setup
    setTimeout(() => {
      this.connectSession(this.DEFAULT_SESSION).catch((err) => {
        this.logger.error(`Initial WhatsApp session failed: ${err.message}`);
      });
    }, 1000);
  }

  async onModuleDestroy() {
    for (const [id, session] of this.sessions) {
      this.logger.log(`Disconnecting session: ${id}`);
      session.socket?.end?.();
    }
  }

  private ensureAuthDir() {
    const sessionDir = path.join(this.AUTH_DIR, this.DEFAULT_SESSION);
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }
  }

  // ── Core Connection (Baileys pattern + Super-Light retry logic) ──
  async connectSession(sessionId: string): Promise<any> {
    const sessionDir = path.join(this.AUTH_DIR, sessionId);
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

    // Version fetch with fallback (from Super-Light whatsapp.js)
    let version: any;
    try {
      const { version: v } = await fetchLatestBaileysVersion();
      version = v;
    } catch {
      version = [2, 3000, 1015901307];
    }

    const pinoLogger = P({ level: 'silent' });

    const sock = makeWASocket({
      version,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pinoLogger),
      },
      printQRInTerminal: false,
      logger: pinoLogger,
      browser: Browsers.ubuntu('Chrome'),
      generateHighQualityLinkPreview: false,
      qrTimeout: 40000,
      markOnlineOnConnect: true,
      syncFullHistory: false,
      connectTimeoutMs: 60000,
      keepAliveIntervalMs: 25000,
      getMessage: async () => ({ conversation: 'hello' }),
    });

    const sessionData: WaSession = {
      socket: sock,
      status: 'CONNECTING',
      retryCount: 0,
    };
    this.sessions.set(sessionId, sessionData);

    sock.ev.on('creds.update', saveCreds);

    // ── Connection lifecycle (Baileys example + Super-Light retry logic) ──
    sock.ev.on('connection.update', async (update: any) => {
      const { connection, lastDisconnect, qr } = update;
      const session = this.sessions.get(sessionId);
      if (!session) return;

      if (qr) {
        session.status = 'QR';
        session.qr = qr;
        this.logger.warn(
          `[${sessionId}] SCAN QR CODE IN WHATSAPP > LINKED DEVICES:`,
        );
        qrcode.generate(qr, { small: true });
      }

      if (connection === 'open') {
        session.status = 'CONNECTED';
        session.qr = undefined;
        session.retryCount = 0;
        session.connectedName = sock.user?.name || sock.user?.id?.split(':')[0];
        this.logger.log(
          `[${sessionId}] WhatsApp Connected as: ${session.connectedName}`,
        );
      }

      if (connection === 'close') {
        const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
        const isLoggedOut =
          statusCode === DisconnectReason.loggedOut || statusCode === 401;

        if (isLoggedOut) {
          session.status = 'LOGGED_OUT';
          this.logger.error(
            `[${sessionId}] Logged out! Deleting session data.`,
          );
          fs.rmSync(sessionDir, { recursive: true, force: true });
        } else {
          session.status = 'DISCONNECTED';
          session.retryCount += 1;
          // Exponential backoff with max 5 retries (from Super-Light)
          if (session.retryCount <= 5) {
            const delay = Math.min(5000 * session.retryCount, 30000);
            this.logger.log(
              `[${sessionId}] Reconnecting in ${delay / 1000}s (attempt ${session.retryCount})...`,
            );
            setTimeout(() => this.connectSession(sessionId), delay);
          } else {
            this.logger.error(
              `[${sessionId}] Max reconnection attempts reached.`,
            );
          }
        }
      }
    });

    // ── Incoming message handler → auto-log to CRM ──
    sock.ev.on('messages.upsert', async ({ messages, type }: any) => {
      if (type !== 'notify') return;

      for (const msg of messages) {
        if (!msg.key?.fromMe && msg.message) {
          await this.handleIncomingMessage(sessionId, msg);
        }
      }
    });
  }

  // ── Incoming message → CRM Activity logger ──
  private async handleIncomingMessage(sessionId: string, msg: any) {
    const from = msg.key?.remoteJid;
    if (!from || from.includes('@g.us')) return; // Skip group messages

    const phone = from.split('@')[0];
    const text =
      msg.message?.conversation || msg.message?.extendedTextMessage?.text;
    if (!text) return;

    this.logger.log(`[${sessionId}] Incoming from ${phone}: ${text}`);

    // Match to a CRM Lead and log the activity
    const lead = await this.prisma.lead.findFirst({
      where: { phone: { contains: phone } },
    });

    if (lead) {
      await this.prisma.activity.create({
        data: {
          leadId: lead.id,
          userId: 'SYSTEM',
          activityType: 'WHATSAPP',
          description: `[INCOMING] ${text}`,
        },
      });
      this.logger.log(
        `[${sessionId}] Logged incoming message for lead: ${lead.name || lead.id}`,
      );
    }
  }

  // ── Send Text (core feature) ──
  async sendMessage(
    phone: string,
    message: string,
    sessionId = this.DEFAULT_SESSION,
  ): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'CONNECTED') {
      this.logger.error(
        `[${sessionId}] Socket not connected. Cannot send message.`,
      );
      return false;
    }

    try {
      const jid = `${phone.replace(/\D/g, '')}@s.whatsapp.net`;
      await session.socket.sendMessage(jid, { text: message });
      this.logger.log(`[${sessionId}] Sent WhatsApp to ${phone}`);
      return true;
    } catch (err) {
      this.logger.error(`[${sessionId}] Failed to send: ${err.message}`);
      return false;
    }
  }

  // ── Send Image (from WPPConnect sendFile pattern) ──
  async sendImage(
    phone: string,
    imageUrl: string,
    caption?: string,
    sessionId = this.DEFAULT_SESSION,
  ): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'CONNECTED') return false;

    try {
      const jid = `${phone.replace(/\D/g, '')}@s.whatsapp.net`;
      await session.socket.sendMessage(jid, {
        image: { url: imageUrl },
        caption: caption || '',
      });
      return true;
    } catch (err) {
      this.logger.error(`sendImage failed: ${err.message}`);
      return false;
    }
  }

  // ── Send Document ──
  async sendDocument(
    phone: string,
    fileUrl: string,
    fileName: string,
    sessionId = this.DEFAULT_SESSION,
  ): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'CONNECTED') return false;

    try {
      const jid = `${phone.replace(/\D/g, '')}@s.whatsapp.net`;
      await session.socket.sendMessage(jid, {
        document: { url: fileUrl },
        fileName,
        mimetype: 'application/octet-stream',
      });
      return true;
    } catch (err) {
      this.logger.error(`sendDocument failed: ${err.message}`);
      return false;
    }
  }

  // ── Bulk broadcast (from Super-Light campaign-sender.js pattern) ──
  async broadcastMessage(
    phones: string[],
    message: string,
    delayMs = 1500,
    sessionId = this.DEFAULT_SESSION,
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;
    for (const phone of phones) {
      const ok = await this.sendMessage(phone, message, sessionId);
      ok ? sent++ : failed++;
      if (phones.indexOf(phone) < phones.length - 1) {
        await new Promise((r) => setTimeout(r, delayMs)); // Rate limiting delay
      }
    }
    this.logger.log(`Broadcast complete: ${sent} sent, ${failed} failed`);
    return { sent, failed };
  }

  // ── Session Management REST helpers ──
  getSessionStatus(sessionId = this.DEFAULT_SESSION) {
    const session = this.sessions.get(sessionId);
    if (!session) return { status: 'NOT_INITIALIZED', qr: null };
    return {
      status: session.status,
      qr: session.qr ?? null,
      connectedAs: session.connectedName ?? null,
    };
  }

  disconnectSession(sessionId = this.DEFAULT_SESSION) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.socket?.end?.();
      this.sessions.delete(sessionId);
    }
  }

  isReady(sessionId = this.DEFAULT_SESSION): boolean {
    return this.sessions.get(sessionId)?.status === 'CONNECTED';
  }
}
