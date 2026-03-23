import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import makeWASocket, {
  DisconnectReason,
  WASocket,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import { usePrismaAuthState } from './prisma-auth-store';
import pino from 'pino';
import { WhatsappGateway } from './whatsapp.gateway';

@Injectable()
export class BaileysEngineService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BaileysEngineService.name);
  
  // Natively stores all connected WebSockets in the NestJS process memory
  // This achieves 100% self-sufficiency without Docker containers
  private readonly sessions = new Map<string, WASocket>();

  // Stores the latest QR code strings waiting to be scanned
  private readonly latestQrs = new Map<string, string>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: WhatsappGateway,
  ) {}

  async onModuleInit() {
    this.logger.log('Booting Native Baileys Engine...');
    await this.restoreActiveSessions();
  }

  async onModuleDestroy() {
    this.logger.log('Gracefully disconnecting all Baileys sessions...');
    for (const [instanceId, socket] of this.sessions.entries()) {
      socket.end(undefined);
    }
  }

  /**
   * On server restart, fetch all connected instances from Postgres and re-attach their sockets.
   */
  private async restoreActiveSessions() {
    const instances = await this.prisma.whatsAppInstance.findMany({
      where: {
        connectionType: 'BAILEYS_NATIVE',
        connectionStatus: 'connected',
      },
    });

    for (const instance of instances) {
      this.logger.log(`Restoring WhatsApp session: ${instance.id} (${instance.name})`);
      await this.startSession(instance.id);
    }
  }

  /**
   * Boots up a Baileys WASocket and attaches it to our nested process memory.
   */
  public async startSession(instanceId: string) {
    if (this.sessions.has(instanceId)) {
      this.logger.warn(`Session ${instanceId} is already running.`);
      const cachedQr = this.latestQrs.get(instanceId);
      if (cachedQr) {
         this.logger.log(`[${instanceId}] Re-emitting cached QR code to frontend...`);
         this.gateway.emitQrCode(instanceId, cachedQr);
      }
      return;
    }

    try {
      const { version, isLatest } = await fetchLatestBaileysVersion();
      this.logger.log(`Setting up Baileys session (v${version.join('.')}) for Instance: ${instanceId}`);

      // Self-Sufficient mapping of cryptography -> PostgreSQL
      const { state, saveCreds } = await usePrismaAuthState(this.prisma, instanceId);

      const pinoLogger = pino({ level: 'silent' });

      const sock = makeWASocket({
        version,
        logger: pinoLogger as any,
        printQRInTerminal: false,
        auth: state,
        syncFullHistory: false,
        markOnlineOnConnect: true,
      });

      this.sessions.set(instanceId, sock);

      // Event 1: Credentials Changed (Save cryptographic session)
      sock.ev.on('creds.update', saveCreds);

      // Event 2: Connection Status Changed (Connecting, Disconnected, Reconnect)
      sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          this.latestQrs.set(instanceId, qr);
          this.logger.debug(`[${instanceId}] New QR Code Generated. Emit to Socket.io GUI -> ${qr.substring(0, 25)}...`);
          // Intercept and emit `qr` to NestJS WebSocket Gateway (Frontend Modal)
          this.gateway.emitQrCode(instanceId, qr);
        }

        if (connection === 'close') {
          this.latestQrs.delete(instanceId);
          const shouldReconnect =
            (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            
          this.logger.warn(`[${instanceId}] Connection closed. Reconnect = ${shouldReconnect}`);

          // Always remove the dead socket from the map first so startSession can re-create it
          this.sessions.delete(instanceId);

          if (shouldReconnect) {
             // Delay reconnect by 2 seconds to avoid tight reconnect storms
             setTimeout(() => this.startSession(instanceId), 2000);
          } else {
             // Logged out permanently — clean up DB state
             this.logger.log(`[${instanceId}] Logged out. Removing from memory and DB.`);
             await this.prisma.whatsAppInstance.update({
               where: { id: instanceId },
               data: { connectionStatus: 'disconnected' },
             });
             await this.prisma.whatsAppAuthState.deleteMany({
                 where: { instanceId }
             });
          }
        }

        if (connection === 'open') {
          this.latestQrs.delete(instanceId);
          this.logger.log(`[${instanceId}] Native WhatsApp Socket Connected Successfully!`);
          await this.prisma.whatsAppInstance.update({
             where: { id: instanceId },
             data: { connectionStatus: 'connected' },
          });
          this.gateway.emitConnected(instanceId);
        }
      });

      // Event 3: Incoming Messages
      sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type === 'notify') {
          for (const msg of messages) {
            if (!msg.message || msg.key.fromMe) continue;
            
            const jid = msg.key.remoteJid;
            const msgId = msg.key.id || `msg_${Date.now()}`;

            this.logger.log(`[${instanceId}] Incoming Message from ${jid}`);

            // Persist the message natively into our standard PostgreSQL database
            await this.prisma.whatsAppMessage.upsert({
               where: { messageId: msgId },
               update: {},
               create: {
                   messageId: msgId,
                   instanceId: instanceId,
                   direction: 'INBOUND',
                   remoteJid: jid || 'unknown',
                   messageType: Object.keys(msg.message)[0] || 'unknown',
                   messageData: msg.message as any,
                   status: 'DELIVERED',
               }
            });

            // Upsert standard Contact logic natively
            if (jid && msg.pushName) {
                await this.prisma.whatsAppContact.upsert({
                    where: { instanceId_remoteJid: { instanceId, remoteJid: jid } },
                    update: { pushName: msg.pushName },
                    create: { instanceId, remoteJid: jid, pushName: msg.pushName }
                });
            }

            // Emit to WebSocket Gateway so the Next.js UI auto-refreshes
            this.gateway.emitMessageUpsert(instanceId, {
               id: msgId,
               instanceId,
               direction: 'INBOUND',
               remoteJid: jid,
               messageData: msg.message,
               timestamp: new Date()
            });
          }
        }
      });

    } catch (error) {
      this.logger.error(`Error starting Baileys Session for ${instanceId}:`, error);
      this.sessions.delete(instanceId);
    }
  }

  /**
   * Retrieves an active socket or throws if disconnected.
   */
  public getSocket(instanceId: string): WASocket {
    const socket = this.sessions.get(instanceId);
    if (!socket) {
      throw new Error(`WhatsApp Instance ${instanceId} is not connected.`);
    }
    return socket;
  }

  /**
   * Sends a WhatsApp text message via the first available connected session.
   * If instanceId is provided, it uses that specific session.
   */
  public async sendMessage(phone: string, message: string, instanceId?: string): Promise<boolean> {
    // Use the provided instanceId or fall back to first available connected session
    let targetId = instanceId;
    if (!targetId) {
      for (const [id, sock] of this.sessions.entries()) {
        if (sock.user) { // sock.user is set when connected
          targetId = id;
          break;
        }
      }
    }

    if (!targetId) {
      this.logger.error('No connected Baileys sessions available to send message.');
      return false;
    }

    const sock = this.sessions.get(targetId);
    if (!sock) {
      this.logger.error(`Session ${targetId} socket not found.`);
      return false;
    }

    try {
      // Format the JID — WhatsApp requires countrycode+number@s.whatsapp.net
      const jid = `${phone.replace(/\D/g, '')}@s.whatsapp.net`;
      await sock.sendMessage(jid, { text: message });
      this.logger.log(`[${targetId}] Sent WhatsApp to ${phone}: "${message.slice(0, 40)}..."`);
      return true;
    } catch (err: any) {
      this.logger.error(`[${targetId}] Failed to send to ${phone}: ${err.message}`);
      return false;
    }
  }

  /**
   * Returns all currently active (connected) sessions with their IDs.
   */
  public getActiveSessions(): string[] {
    const active: string[] = [];
    for (const [id, sock] of this.sessions.entries()) {
      if (sock.user) active.push(id);
    }
    return active;
  }
}
