import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Controller, Post, Get, Body, Res, Param, Query } from '@nestjs/common';
import type { Response } from 'express';
import { CommunicationsService } from './communications.service';
import { WhatsAppClientService } from './whatsapp-client.service';
import { PrismaService } from '../prisma/prisma.service';
import * as QRCode from 'qrcode';

@UseGuards(JwtAuthGuard)
@Controller('communications')
export class CommunicationsController {
  constructor(
    private readonly commsService: CommunicationsService,
    private readonly waClient: WhatsAppClientService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * POST /communications/send
   * Send WA/Email to a lead
   */
  @Post('send')
  async send(@Body() body: { leadId: string; channel?: string; type?: string; message?: string; content?: string; userId?: string }) {
    const type = (body.channel || body.type || 'WHATSAPP') as 'WHATSAPP' | 'EMAIL' | 'SMS';
    const message = body.content || body.message || '';
    return this.commsService.sendCommunication(body.leadId, type, message, body.userId || 'SYSTEM');
  }

  /**
   * GET /communications/threads
   * Inbox thread list — group activities by lead
   */
  @Get('threads')
  async getThreads() {
    const activities = (await this.prisma.activity.findMany({
      where: { activityType: { in: ['WHATSAPP', 'EMAIL', 'SMS'] } },
      include: { lead: { select: { id: true, name: true, firstName: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
      take: 500,
    })) as any[];

    const threadMap = new Map<string, any>();
    for (const a of activities) {
      if (!a.lead) continue;
      if (!threadMap.has(a.leadId)) {
        threadMap.set(a.leadId, {
          leadId: a.leadId,
          leadName: a.lead.name || a.lead.firstName,
          phone: a.lead.phone,
          lastMessage: (a.description || '').slice(0, 60),
          lastChannel: a.activityType,
          lastAt: a.createdAt,
          unread: 0,
        });
      }
    }
    return Array.from(threadMap.values());
  }

  /**
   * GET /communications/thread/:leadId
   * All messages in a conversation
   */
  @Get('thread/:leadId')
  async getThread(@Param('leadId') leadId: string) {
    const activities = (await this.prisma.activity.findMany({
      where: { leadId, activityType: { in: ['WHATSAPP', 'EMAIL', 'SMS'] } },
      orderBy: { createdAt: 'asc' },
    })) as any[];

    return activities.map(a => ({
      id: a.id,
      direction: 'OUTBOUND',
      channel: a.activityType,
      content: a.description,
      status: 'DELIVERED',
      createdAt: a.createdAt,
    }));
  }

  @Get('whatsapp/status')
  getWhatsAppStatus() { return this.waClient.getSessionStatus(); }

  @Get('whatsapp/qr-image')
  async getQrImage(@Res() res: Response) {
    const status = this.waClient.getSessionStatus();
    if (!status.qr) {
      return res.status(status.status === 'CONNECTED' ? 200 : 404).json({
        status: status.status,
        message: status.status === 'CONNECTED' ? 'Already connected!' : 'QR not available yet.',
      });
    }
    const buffer = await QRCode.toBuffer(status.qr, { scale: 8 });
    res.set('Content-Type', 'image/png');
    res.set('Cache-Control', 'no-cache, no-store');
    res.end(buffer);
  }

  @Post('broadcast')
  async broadcast(@Body() body: { phones: string[]; message: string; delayMs?: number }) {
    return this.waClient.broadcastMessage(body.phones, body.message, body.delayMs);
  }
}
