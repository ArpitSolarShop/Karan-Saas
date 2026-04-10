import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards, Req } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaileysEngineService } from './baileys.service';
import { CloudApiService } from './cloud-api.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';

@Controller('whatsapp')
@UseGuards(JwtAuthGuard, TenantGuard)
export class WhatsappController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly baileysEngine: BaileysEngineService,
    private readonly cloudApi: CloudApiService,
  ) {}

  // ─────────────────────────────────────────────────
  // INSTANCE MANAGEMENT
  // ─────────────────────────────────────────────────

  @Get('instances')
  async getInstances(@Req() req: any) {
    const tenantId = req.user.tenantId;
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
      name: string;
      connectionType?: 'CLOUD_API' | 'BAILEYS_NATIVE';
      phoneNumberId?: string;
      wabaId?: string;
      accessToken?: string;
      phoneNumber?: string;
      businessName?: string;
      webhookVerifyToken?: string;
    },
    @Req() req: any,
  ) {
    const tenantId = req.user.tenantId;
    const connectionType = data.connectionType || 'BAILEYS_NATIVE';

    try {
      // name is strictly unique to prevent P2002 errors
      const uniqueName = data.name + ' - ' + Math.floor(Math.random() * 10000);

      const instance = await this.prisma.whatsAppInstance.create({
        data: {
          tenantId,
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
      userAccessToken: string;
      instanceName?: string;
    },
    @Req() req: any,
  ) {
    return this.cloudApi.exchangeTokenAndProvision(
      req.user.tenantId,
      data.userAccessToken,
      data.instanceName,
    );
  }

  @Post('instances/:id/connect')
  async connectInstance(@Param('id') id: string, @Req() req: any) {
    const instance = await this.prisma.whatsAppInstance.findFirst({
      where: { id, tenantId: req.user.tenantId },
    });

    if (!instance) {
      return { success: false, message: 'Instance not found.' };
    }

    if (instance.connectionType === 'CLOUD_API') {
      // Cloud API instances are "connected" as soon as credentials are valid
      // We can test the connection by fetching phone number details
      try {
        const details = await this.cloudApi.getPhoneNumberDetails(id, req.user.tenantId);
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
    await this.baileysEngine.startSession(id, req.user.tenantId);
    return { success: true, message: 'Session boot sequence initiated.' };
  }

  @Delete('instances/:id/disconnect')
  async disconnectInstance(@Param('id') id: string, @Req() req: any) {
    const instance = await this.prisma.whatsAppInstance.findFirst({
      where: { id, tenantId: req.user.tenantId },
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
    @Req() req: any,
  ) {
    const instance = await this.prisma.whatsAppInstance.findFirst({
      where: { id: data.instanceId, tenantId: req.user.tenantId },
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
        req.user.tenantId,
      );
      return result;
    }

    // ── BAILEYS PATH (instrumented) ──
    return this.baileysEngine.sendMessage(data.jid, data.text, data.instanceId, req.user.tenantId);
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
    @Req() req: any,
  ) {
    const instance = await this.prisma.whatsAppInstance.findFirst({
      where: { id: data.instanceId, tenantId: req.user.tenantId },
    });
    if (!instance) return { success: false, message: 'Instance not found or unauthorized.' };

    return this.cloudApi.sendTemplateMessage(
      data.instanceId,
      data.to,
      data.templateName,
      data.languageCode,
      req.user.tenantId,
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
    @Req() req: any,
  ) {
    const instance = await this.prisma.whatsAppInstance.findFirst({
      where: { id: data.instanceId, tenantId: req.user.tenantId },
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
        req.user.tenantId,
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
    @Req() req: any,
  ) {
    const instance = await this.prisma.whatsAppInstance.findFirst({
      where: { id: data.instanceId, tenantId: req.user.tenantId },
    });
    if (!instance) return { success: false, message: 'Instance not found or unauthorized.' };

    return this.cloudApi.sendInteractiveMessage(
      data.instanceId,
      data.to,
      data.interactive,
      req.user.tenantId,
    );
  }

  @Post('messages/:wamid/read')
  async markAsRead(
    @Param('wamid') wamid: string,
    @Body() data: { instanceId: string },
    @Req() req: any,
  ) {
    const instance = await this.prisma.whatsAppInstance.findFirst({
      where: { id: data.instanceId, tenantId: req.user.tenantId },
    });
    if (!instance) return { success: false, message: 'Instance not found or unauthorized.' };
    return this.cloudApi.markAsRead(data.instanceId, wamid, req.user.tenantId);
  }

  // ─────────────────────────────────────────────────
  // TEMPLATE MANAGEMENT (Cloud API only)
  // ─────────────────────────────────────────────────

  @Get('templates/:instanceId')
  async getTemplates(@Param('instanceId') instanceId: string, @Req() req: any) {
    const instance = await this.prisma.whatsAppInstance.findFirst({
      where: { id: instanceId, tenantId: req.user.tenantId },
    });
    if (!instance) return { success: false, message: 'Instance not found or unauthorized.' };
    return this.cloudApi.getTemplates(instanceId, req.user.tenantId);
  }

  @Post('templates/:instanceId/sync')
  async syncTemplates(@Param('instanceId') instanceId: string, @Req() req: any) {
    const instance = await this.prisma.whatsAppInstance.findFirst({
      where: { id: instanceId, tenantId: req.user.tenantId },
    });
    if (!instance) return { success: false, message: 'Instance not found or unauthorized.' };
    return this.cloudApi.syncTemplates(instanceId, req.user.tenantId);
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
    @Req() req: any,
  ) {
    const instance = await this.prisma.whatsAppInstance.findFirst({
      where: { id: instanceId, tenantId: req.user.tenantId },
    });
    if (!instance) return { success: false, message: 'Instance not found or unauthorized.' };
    return this.cloudApi.createTemplate(instanceId, data, req.user.tenantId);
  }

  @Delete('templates/:instanceId/:templateName')
  async deleteTemplate(
    @Param('instanceId') instanceId: string,
    @Param('templateName') templateName: string,
    @Req() req: any,
  ) {
    const instance = await this.prisma.whatsAppInstance.findFirst({
      where: { id: instanceId, tenantId: req.user.tenantId },
    });
    if (!instance) return { success: false, message: 'Instance not found or unauthorized.' };
    return this.cloudApi.deleteTemplate(instanceId, templateName, req.user.tenantId);
  }

  // ─────────────────────────────────────────────────
  // PHONE NUMBER & BUSINESS PROFILE (Cloud API only)
  // ─────────────────────────────────────────────────

  @Get('phone-numbers/:instanceId')
  async getPhoneNumbers(@Param('instanceId') instanceId: string, @Req() req: any) {
    const instance = await this.prisma.whatsAppInstance.findFirst({
      where: { id: instanceId, tenantId: req.user.tenantId },
    });
    if (!instance) return { success: false, message: 'Instance not found or unauthorized.' };
    return this.cloudApi.getPhoneNumbers(instanceId, req.user.tenantId);
  }

  @Get('business-profile/:instanceId')
  async getBusinessProfile(@Param('instanceId') instanceId: string, @Req() req: any) {
    const instance = await this.prisma.whatsAppInstance.findFirst({
      where: { id: instanceId, tenantId: req.user.tenantId },
    });
    if (!instance) return { success: false, message: 'Instance not found or unauthorized.' };
    return this.cloudApi.getBusinessProfile(instanceId, req.user.tenantId);
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
    @Req() req: any,
  ) {
    const instance = await this.prisma.whatsAppInstance.findFirst({
      where: { id: instanceId, tenantId: req.user.tenantId },
    });
    if (!instance) return { success: false, message: 'Instance not found or unauthorized.' };
    return this.cloudApi.updateBusinessProfile(instanceId, data, req.user.tenantId);
  }

  // ─────────────────────────────────────────────────
  // MESSAGES HISTORY
  // ─────────────────────────────────────────────────

  @Get('messages/:instanceId')
  async getMessages(
    @Param('instanceId') instanceId: string,
    @Req() req: any,
    @Query('jid') jid?: string,
    @Query('limit') limit?: string,
  ) {
    const instance = await this.prisma.whatsAppInstance.findFirst({
      where: { id: instanceId, tenantId: req.user.tenantId },
    });
    if (!instance) return { success: false, message: 'Instance not found or unauthorized.' };

    return this.prisma.whatsAppMessage.findMany({
      where: {
        instanceId,
        tenantId: req.user.tenantId,
        ...(jid ? { remoteJid: jid } : {}),
      },
      orderBy: { timestamp: 'asc' },
      take: parseInt(limit || '100'),
    });
  }

  @Get('contacts/:instanceId')
  async getContacts(@Param('instanceId') instanceId: string, @Req() req: any) {
    const instance = await this.prisma.whatsAppInstance.findFirst({
      where: { id: instanceId, tenantId: req.user.tenantId },
    });
    if (!instance) return { success: false, message: 'Instance not found or unauthorized.' };

    return this.prisma.whatsAppContact.findMany({
      where: { instanceId, tenantId: req.user.tenantId },
      orderBy: { pushName: 'asc' },
    });
  }
}
