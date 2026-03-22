import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaileysEngineService } from './baileys.service';
import { CloudApiService } from './cloud-api.service';

@Controller('whatsapp')
export class WhatsappController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly baileysEngine: BaileysEngineService,
    private readonly cloudApi: CloudApiService,
  ) {}

  // ─────────────────────────────────────────────────
  // INSTANCE MANAGEMENT
  // ─────────────────────────────────────────────────

  @Get('instances/:tenantId')
  async getInstances(@Param('tenantId') tenantId: string) {
    return this.prisma.whatsAppInstance.findMany({
      where: { tenantId },
      include: {
        _count: {
          select: { messages: true, contacts: true, templates: true },
        },
      },
    });
  }

  @Post('instances')
  async createInstance(
    @Body()
    data: {
      tenantId: string;
      name: string;
      connectionType?: 'CLOUD_API' | 'BAILEYS_NATIVE';
      phoneNumberId?: string;
      wabaId?: string;
      accessToken?: string;
      phoneNumber?: string;
      businessName?: string;
      webhookVerifyToken?: string;
    },
  ) {
    const connectionType = data.connectionType || 'BAILEYS_NATIVE';

    try {
      // First, ensure the tenant exists (if using generic 'demo-tenant-id' from frontend placeholder)
      if (data.tenantId) {
        const tenantExists = await this.prisma.tenant.findUnique({ where: { id: data.tenantId } });
        if (!tenantExists) {
          await this.prisma.tenant.create({
            data: { 
              id: data.tenantId, 
              name: 'Demo Tenant', 
              subdomain: `demo-${data.tenantId.substring(0, 8)}-${Math.floor(Math.random() * 1000)}` 
            }
          });
        }
      }

      // Ensure name is strictly unique to prevent P2002 errors
      const uniqueName = data.name + ' - ' + Math.floor(Math.random() * 10000);

      const instance = await this.prisma.whatsAppInstance.create({
        data: {
          tenantId: data.tenantId,
          name: uniqueName,
          connectionType,
          connectionStatus: connectionType === 'CLOUD_API' ? 'connected' : 'disconnected',
          phoneNumber: data.phoneNumber,
          phoneNumberId: data.phoneNumberId,
          wabaId: data.wabaId,
          accessToken: data.accessToken,
          businessName: data.businessName,
          webhookVerifyToken: data.webhookVerifyToken,
        },
      });

      return instance;
    } catch (error) {
      console.error('[WhatsAppController] Failed to create instance:', error);
      throw error; // Will be caught by NestJS exception filter and returned as 500 but printed to our logs
    }
  }

  // ─────────────────────────────────────────────────
  // EMBEDDED SIGNUP
  // ─────────────────────────────────────────────────

  @Post('embedded-signup')
  async handleEmbeddedSignup(
    @Body()
    data: {
      tenantId: string;
      userAccessToken: string;
      instanceName?: string;
    },
  ) {
    return this.cloudApi.exchangeTokenAndProvision(
      data.tenantId,
      data.userAccessToken,
      data.instanceName,
    );
  }

  @Post('instances/:id/connect')
  async connectInstance(@Param('id') id: string) {
    const instance = await this.prisma.whatsAppInstance.findUnique({
      where: { id },
    });

    if (!instance) {
      return { success: false, message: 'Instance not found.' };
    }

    if (instance.connectionType === 'CLOUD_API') {
      // Cloud API instances are "connected" as soon as credentials are valid
      // We can test the connection by fetching phone number details
      try {
        const details = await this.cloudApi.getPhoneNumberDetails(id);
        await this.prisma.whatsAppInstance.update({
          where: { id },
          data: { connectionStatus: 'connected' },
        });
        return {
          success: true,
          message: 'Cloud API connection verified.',
          phoneDetails: details,
        };
      } catch (err) {
        return {
          success: false,
          message: `Cloud API connection failed: ${(err as Error).message}`,
        };
      }
    }

    // Baileys — starts QR code session
    await this.baileysEngine.startSession(id);
    return { success: true, message: 'Session boot sequence initiated.' };
  }

  @Delete('instances/:id/disconnect')
  async disconnectInstance(@Param('id') id: string) {
    const instance = await this.prisma.whatsAppInstance.findUnique({
      where: { id },
    });

    if (!instance) {
      return { success: false, message: 'Instance not found.' };
    }

    if (instance.connectionType === 'CLOUD_API') {
      await this.prisma.whatsAppInstance.update({
        where: { id },
        data: { connectionStatus: 'disconnected' },
      });
      return { success: true, message: 'Cloud API instance disconnected.' };
    }

    // Baileys disconnect
    try {
      const socket = this.baileysEngine.getSocket(id);
      await socket.logout();
    } catch (err) {
      // Socket may already be gone (server restart, lost connection, etc.)
      // Update DB status anyway so the UI reflects reality
      await this.prisma.whatsAppInstance.update({
        where: { id },
        data: { connectionStatus: 'disconnected' },
      });
      return { success: true, message: 'Instance was already disconnected.' };
    }
    return { success: true, message: 'Disconnection initiated.' };
  }

  // ─────────────────────────────────────────────────
  // SEND MESSAGES (Routes by connectionType)
  // ─────────────────────────────────────────────────

  @Post('send/text')
  async sendText(
    @Body() data: { instanceId: string; jid: string; text: string },
  ) {
    const instance = await this.prisma.whatsAppInstance.findUnique({
      where: { id: data.instanceId },
    });

    if (!instance) {
      return { success: false, message: 'Instance not found.' };
    }

    // ── CLOUD API PATH ──
    if (instance.connectionType === 'CLOUD_API') {
      const result = await this.cloudApi.sendTextMessage(
        data.instanceId,
        data.jid,
        data.text,
      );
      return result;
    }

    // ── BAILEYS PATH (existing) ──
    const socket = this.baileysEngine.getSocket(data.instanceId);
    let targetJid = data.jid;
    if (!targetJid.includes('@')) {
      targetJid = `${targetJid}@s.whatsapp.net`;
    }
    const sentMsg = await socket.sendMessage(targetJid, { text: data.text });
    return { success: true, messageId: sentMsg?.key.id };
  }

  @Post('send/template')
  async sendTemplate(
    @Body()
    data: {
      instanceId: string;
      to: string;
      templateName: string;
      languageCode: string;
      components?: any[];
    },
  ) {
    return this.cloudApi.sendTemplateMessage(
      data.instanceId,
      data.to,
      data.templateName,
      data.languageCode,
      data.components,
    );
  }

  @Post('send/media')
  async sendMedia(
    @Body()
    data: {
      instanceId: string;
      to: string;
      mediaType: 'image' | 'document' | 'video' | 'audio';
      mediaUrl: string;
      caption?: string;
      filename?: string;
    },
  ) {
    const instance = await this.prisma.whatsAppInstance.findUnique({
      where: { id: data.instanceId },
    });

    if (!instance) {
      return { success: false, message: 'Instance not found.' };
    }

    // ── CLOUD API PATH ──
    if (instance.connectionType === 'CLOUD_API') {
      return this.cloudApi.sendMediaMessage(
        data.instanceId,
        data.to,
        data.mediaType,
        data.mediaUrl,
        data.caption,
        data.filename,
      );
    }

    // ── BAILEYS PATH ──
    const socket = this.baileysEngine.getSocket(data.instanceId);
    let targetJid = data.to;
    if (!targetJid.includes('@')) {
      targetJid = `${targetJid}@s.whatsapp.net`;
    }

    const mediaPayload: any = {};
    switch (data.mediaType) {
      case 'image':
        mediaPayload.image = { url: data.mediaUrl };
        if (data.caption) mediaPayload.caption = data.caption;
        break;
      case 'document':
        mediaPayload.document = { url: data.mediaUrl };
        mediaPayload.fileName = data.filename || 'document';
        mediaPayload.mimetype = 'application/octet-stream';
        break;
      case 'video':
        mediaPayload.video = { url: data.mediaUrl };
        if (data.caption) mediaPayload.caption = data.caption;
        break;
      case 'audio':
        mediaPayload.audio = { url: data.mediaUrl };
        break;
    }

    const sentMsg = await socket.sendMessage(targetJid, mediaPayload);
    return { success: true, messageId: sentMsg?.key.id };
  }

  @Post('send/interactive')
  async sendInteractive(
    @Body()
    data: {
      instanceId: string;
      to: string;
      interactive: any;
    },
  ) {
    return this.cloudApi.sendInteractiveMessage(
      data.instanceId,
      data.to,
      data.interactive,
    );
  }

  @Post('messages/:wamid/read')
  async markAsRead(
    @Param('wamid') wamid: string,
    @Body() data: { instanceId: string },
  ) {
    return this.cloudApi.markAsRead(data.instanceId, wamid);
  }

  // ─────────────────────────────────────────────────
  // TEMPLATE MANAGEMENT (Cloud API only)
  // ─────────────────────────────────────────────────

  @Get('templates/:instanceId')
  async getTemplates(@Param('instanceId') instanceId: string) {
    return this.cloudApi.getTemplates(instanceId);
  }

  @Post('templates/:instanceId/sync')
  async syncTemplates(@Param('instanceId') instanceId: string) {
    return this.cloudApi.syncTemplates(instanceId);
  }

  @Post('templates/:instanceId')
  async createTemplate(
    @Param('instanceId') instanceId: string,
    @Body()
    data: {
      name: string;
      category: string;
      language: string;
      components: any[];
    },
  ) {
    return this.cloudApi.createTemplate(instanceId, data);
  }

  @Delete('templates/:instanceId/:templateName')
  async deleteTemplate(
    @Param('instanceId') instanceId: string,
    @Param('templateName') templateName: string,
  ) {
    return this.cloudApi.deleteTemplate(instanceId, templateName);
  }

  // ─────────────────────────────────────────────────
  // PHONE NUMBER & BUSINESS PROFILE (Cloud API only)
  // ─────────────────────────────────────────────────

  @Get('phone-numbers/:instanceId')
  async getPhoneNumbers(@Param('instanceId') instanceId: string) {
    return this.cloudApi.getPhoneNumbers(instanceId);
  }

  @Get('business-profile/:instanceId')
  async getBusinessProfile(@Param('instanceId') instanceId: string) {
    return this.cloudApi.getBusinessProfile(instanceId);
  }

  @Post('business-profile/:instanceId')
  async updateBusinessProfile(
    @Param('instanceId') instanceId: string,
    @Body()
    data: {
      about?: string;
      address?: string;
      description?: string;
      email?: string;
      websites?: string[];
      vertical?: string;
    },
  ) {
    return this.cloudApi.updateBusinessProfile(instanceId, data);
  }

  // ─────────────────────────────────────────────────
  // MESSAGES HISTORY
  // ─────────────────────────────────────────────────

  @Get('messages/:instanceId')
  async getMessages(
    @Param('instanceId') instanceId: string,
    @Query('jid') jid?: string,
    @Query('limit') limit?: string,
  ) {
    return this.prisma.whatsAppMessage.findMany({
      where: {
        instanceId,
        ...(jid ? { remoteJid: jid } : {}),
      },
      orderBy: { timestamp: 'asc' },
      take: parseInt(limit || '100'),
    });
  }

  @Get('contacts/:instanceId')
  async getContacts(@Param('instanceId') instanceId: string) {
    return this.prisma.whatsAppContact.findMany({
      where: { instanceId },
      orderBy: { pushName: 'asc' },
    });
  }
}
