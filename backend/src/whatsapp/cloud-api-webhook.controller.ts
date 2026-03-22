import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Res,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappGateway } from './whatsapp.gateway';
import { Public } from '../auth/public.decorator';

/**
 * CloudApiWebhookController
 *
 * Handles incoming Webhook events from Meta's WhatsApp Cloud API.
 * This controller is NOT JWT-protected because Meta needs public access to it.
 *
 * Two endpoints:
 *   GET  /whatsapp/webhook — Verification handshake (Meta calls this when you register the webhook URL)
 *   POST /whatsapp/webhook — Receives incoming messages, status updates, read receipts
 */
@Controller('whatsapp/webhook')
export class CloudApiWebhookController {
  private readonly logger = new Logger(CloudApiWebhookController.name);
  private readonly verifyToken: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly gateway: WhatsappGateway,
  ) {
    this.verifyToken = this.config.get(
      'META_WEBHOOK_VERIFY_TOKEN',
      'karan_saas_webhook_verify',
    );
  }

  /**
   * GET /whatsapp/webhook
   * Meta sends this during webhook registration to verify your endpoint.
   * Must return the hub.challenge value as plain text.
   */
  @Public()
  @Get()
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    this.logger.log(
      `[Webhook Verify] mode=${mode}, token=${token ? '***' : 'NONE'}`,
    );

    if (mode === 'subscribe' && token === this.verifyToken) {
      this.logger.log('[Webhook Verify] ✅ Verification successful!');
      return res.status(HttpStatus.OK).send(challenge);
    }

    this.logger.warn('[Webhook Verify] ❌ Verification failed — token mismatch.');
    return res.status(HttpStatus.FORBIDDEN).send('Verification failed');
  }

  /**
   * POST /whatsapp/webhook
   * Meta pushes ALL events here: incoming messages, status updates, read receipts, etc.
   * We MUST always return 200 quickly to avoid Meta retrying.
   */
  @Public()
  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() body: any) {
    // Always respond 200 immediately — Meta retries on timeouts
    // Process async in background
    this.processWebhookAsync(body).catch((err) => {
      this.logger.error(`Webhook processing error: ${err.message}`);
    });

    return { status: 'EVENT_RECEIVED' };
  }

  // ──────────────────────────────────────────────────
  // PRIVATE: Async webhook processing
  // ──────────────────────────────────────────────────

  private async processWebhookAsync(body: any) {
    if (body?.object !== 'whatsapp_business_account') {
      this.logger.warn(`Ignoring non-WhatsApp webhook: ${body?.object}`);
      return;
    }

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value;
        if (!value) continue;

        const phoneNumberId = value.metadata?.phone_number_id;

        // Find the instance by phoneNumberId
        const instance = await this.prisma.whatsAppInstance.findFirst({
          where: {
            phoneNumberId,
            connectionType: 'CLOUD_API',
          },
        });

        if (!instance) {
          this.logger.warn(
            `No Cloud API instance found for phoneNumberId: ${phoneNumberId}`,
          );
          continue;
        }

        // Handle incoming messages
        if (value.messages && value.messages.length > 0) {
          await this.handleIncomingMessages(
            instance.id,
            value.messages,
            value.contacts || [],
          );
        }

        // Handle status updates (sent, delivered, read, failed)
        if (value.statuses && value.statuses.length > 0) {
          await this.handleStatusUpdates(instance.id, value.statuses);
        }
      }
    }
  }

  /**
   * Process incoming messages from customers.
   */
  private async handleIncomingMessages(
    instanceId: string,
    messages: any[],
    contacts: any[],
  ) {
    for (const msg of messages) {
      const from = msg.from; // Customer's phone number (e.g. "919876543210")
      const wamid = msg.id;
      const timestamp = msg.timestamp;
      const msgType = msg.type; // text, image, document, interactive, button, etc.

      // Extract message body based on type
      let messageData: any = {};
      switch (msgType) {
        case 'text':
          messageData = { body: msg.text?.body };
          break;
        case 'image':
          messageData = {
            imageId: msg.image?.id,
            caption: msg.image?.caption,
            mimeType: msg.image?.mime_type,
          };
          break;
        case 'document':
          messageData = {
            documentId: msg.document?.id,
            filename: msg.document?.filename,
            caption: msg.document?.caption,
            mimeType: msg.document?.mime_type,
          };
          break;
        case 'video':
          messageData = {
            videoId: msg.video?.id,
            caption: msg.video?.caption,
            mimeType: msg.video?.mime_type,
          };
          break;
        case 'audio':
          messageData = {
            audioId: msg.audio?.id,
            mimeType: msg.audio?.mime_type,
          };
          break;
        case 'location':
          messageData = {
            latitude: msg.location?.latitude,
            longitude: msg.location?.longitude,
            name: msg.location?.name,
            address: msg.location?.address,
          };
          break;
        case 'contacts':
          messageData = { contacts: msg.contacts };
          break;
        case 'interactive':
          messageData = {
            type: msg.interactive?.type,
            button_reply: msg.interactive?.button_reply,
            list_reply: msg.interactive?.list_reply,
          };
          break;
        case 'button':
          messageData = { text: msg.button?.text, payload: msg.button?.payload };
          break;
        case 'reaction':
          messageData = {
            emoji: msg.reaction?.emoji,
            message_id: msg.reaction?.message_id,
          };
          break;
        case 'sticker':
          messageData = {
            stickerId: msg.sticker?.id,
            mimeType: msg.sticker?.mime_type,
          };
          break;
        default:
          messageData = msg[msgType] || {};
      }

      this.logger.log(
        `[${instanceId}] Incoming ${msgType} from ${from}: ${JSON.stringify(messageData).substring(0, 100)}`,
      );

      // Persist to WhatsAppMessage
      await this.prisma.whatsAppMessage.upsert({
        where: { messageId: wamid },
        update: {},
        create: {
          messageId: wamid,
          instanceId,
          direction: 'INBOUND',
          remoteJid: from,
          messageType: msgType,
          messageData: messageData as any,
          status: 'DELIVERED',
          timestamp: new Date(parseInt(timestamp) * 1000),
        },
      });

      // Upsert contact
      const contactInfo = contacts.find(
        (c: any) => c.wa_id === from,
      );
      if (contactInfo) {
        await this.prisma.whatsAppContact.upsert({
          where: {
            instanceId_remoteJid: { instanceId, remoteJid: from },
          },
          update: {
            pushName: contactInfo.profile?.name || null,
          },
          create: {
            instanceId,
            remoteJid: from,
            pushName: contactInfo.profile?.name || null,
          },
        });
      }

      // Emit to Socket.io Gateway for real-time frontend update
      this.gateway.emitMessageUpsert(instanceId, {
        id: wamid,
        instanceId,
        direction: 'INBOUND',
        remoteJid: from,
        messageType: msgType,
        messageData,
        timestamp: new Date(parseInt(timestamp) * 1000),
      });

      // Log to CRM Activity (if lead exists with this phone)
      try {
        const lead = await this.prisma.lead.findFirst({
          where: { phone: { contains: from } },
        });

        if (lead) {
          // Resolve a valid userId for the FK
          const systemUser = await this.prisma.user.findFirst({
            select: { id: true },
          });

          if (systemUser) {
            await this.prisma.activity.create({
              data: {
                leadId: lead.id,
                userId: systemUser.id,
                activityType: 'WHATSAPP',
                description: `[CLOUD_API INBOUND] ${msgType}: ${messageData.body || messageData.caption || JSON.stringify(messageData).substring(0, 80)}`,
              },
            });
          }
        }
      } catch (err) {
        this.logger.warn(`CRM activity logging failed: ${(err as Error).message}`);
      }
    }
  }

  /**
   * Process message delivery/read status updates.
   */
  private async handleStatusUpdates(instanceId: string, statuses: any[]) {
    for (const status of statuses) {
      const wamid = status.id;
      const statusValue = status.status; // sent | delivered | read | failed
      const recipientId = status.recipient_id;

      this.logger.debug(
        `[${instanceId}] Status update: ${wamid} → ${statusValue} (to: ${recipientId})`,
      );

      // Map Meta statuses to our internal status format
      const statusMap: Record<string, string> = {
        sent: 'SENT',
        delivered: 'DELIVERED',
        read: 'READ',
        failed: 'FAILED',
      };

      try {
        await this.prisma.whatsAppMessage.updateMany({
          where: { messageId: wamid },
          data: { status: statusMap[statusValue] || statusValue.toUpperCase() },
        });
      } catch {
        // Message might not exist locally (e.g., sent before our system was set up)
        this.logger.debug(
          `Could not update status for message ${wamid} — not found locally.`,
        );
      }

      // Handle failed messages — log the error
      if (statusValue === 'failed' && status.errors) {
        for (const err of status.errors) {
          this.logger.error(
            `[${instanceId}] Message ${wamid} FAILED: [${err.code}] ${err.title} — ${err.message}`,
          );
        }
      }
    }
  }
}
