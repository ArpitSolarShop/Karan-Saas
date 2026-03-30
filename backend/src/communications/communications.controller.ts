import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Controller, Post, Get, Body, Res, Param, Query } from '@nestjs/common';
import type { Response } from 'express';
import { CommunicationsService } from './communications.service';
import { BaileysEngineService } from '../whatsapp/baileys.service';
import { PrismaService } from '../prisma/prisma.service';
import * as QRCode from 'qrcode';

@UseGuards(JwtAuthGuard)
@Controller('communications')
export class CommunicationsController {
  constructor(
    private readonly commsService: CommunicationsService,
    private readonly baileysEngine: BaileysEngineService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * POST /communications/send
   * Send WA/Email to a lead
   */
  @Post('send')
  async send(
    @Body()
    body: {
      leadId: string;
      channel?: string;
      type?: string;
      message?: string;
      content?: string;
      userId?: string;
    },
  ) {
    const type = (body.channel || body.type || 'WHATSAPP') as
      | 'WHATSAPP'
      | 'EMAIL'
      | 'SMS';
    const message = body.content || body.message || '';
    return this.commsService.sendCommunication(
      body.leadId,
      type,
      message,
      body.userId || 'SYSTEM',
    );
  }

  /**
   * GET /communications/threads
   * Inbox thread list — group activities by lead
   */
  @Get('threads')
  async getThreads() {
    const activities = (await this.prisma.activity.findMany({
      where: { activityType: { in: ['WHATSAPP', 'EMAIL', 'SMS'] } },
      include: {
        lead: {
          select: { id: true, name: true, firstName: true, phone: true },
        },
      },
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
   * All messages — merges Activity table (CRM-sent/received) +
   * WhatsAppMessage table (raw Baileys history) for complete conversation.
   */
  @Get('thread/:leadId')
  async getThread(@Param('leadId') paramLeadId: string, @Query('phone') qPhone?: string) {
    let leadId = paramLeadId;
    let fallbackPhone = qPhone;

    // Resolve SheetRow.id to Lead.id by phone if paramLeadId doesn't belong to a Lead
    let lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      select: { id: true, phone: true, name: true, firstName: true },
    });

    if (!lead) {
      const sheetRow = await this.prisma.sheetRow.findUnique({
        where: { id: leadId },
      });
      if (sheetRow) {
        const rowData = sheetRow.data as any;
        const phone = rowData.phone || rowData.phone_primary || rowData.phone_number || qPhone;
        fallbackPhone = phone;
        if (phone) {
          const existingLead = await this.prisma.lead.findFirst({
            where: { phone: String(phone) },
            select: { id: true, phone: true, name: true, firstName: true },
          });
          if (existingLead) {
            lead = existingLead;
            leadId = lead.id; // Switch to query Activity by the real lead ID
          }
        }
      }
    }

    // ── 1. Activity-based messages (outbound CRM sends + newly-logged inbound) ──
    const activities = (await this.prisma.activity.findMany({
      where: { leadId, activityType: { in: ['WHATSAPP', 'EMAIL', 'SMS'] } },
      orderBy: { createdAt: 'asc' },
    })) as any[];

    const activityMsgs = activities.map((a) => ({
      id: `act_${a.id}`,
      direction: (a.description || '').startsWith('[INCOMING]') ? 'INBOUND' : 'OUTBOUND',
      channel: a.activityType as string,
      content: (a.description || '')
        .replace(/^\[INCOMING\]\s*/, '')
        .replace(/^Sent (WHATSAPP|SMS|EMAIL)(?: to [^:]+)?: /, ''),
      status: 'DELIVERED',
      createdAt: a.createdAt as Date,
    }));

    let waMsgs: any[] = [];
    const leadPhone = lead?.phone || fallbackPhone;
    if (leadPhone) {
      const phone = leadPhone.replace(/\D/g, '');
      const phone10 = phone.slice(-10);
      const phoneWithCountry = phone.length === 10 ? `91${phone}` : phone;

      // Find matching WhatsApp messages by JID (phone or LID matched by contact pushName)
      const leadName = (lead?.name || lead?.firstName || '').toLowerCase();


      const rawMsgs = await this.prisma.whatsAppMessage.findMany({
        where: {
          OR: [
            { remoteJid: { contains: phone10 } },
            { remoteJid: { contains: phoneWithCountry } },
          ],
          // Exclude group and broadcast
          NOT: [
            { remoteJid: { endsWith: '@g.us' } },
            { remoteJid: 'status@broadcast' },
          ],
        },
        orderBy: { timestamp: 'asc' },
        take: 200,
      });

      // Also fetch LID-based messages matched by contact pushName
      if (leadName) {
        const lidContacts = await this.prisma.whatsAppContact.findMany({
          where: {
            pushName: { contains: leadName.split(' ')[0], mode: 'insensitive' },
            remoteJid: { endsWith: '@lid' },
          },
        });
        if (lidContacts.length > 0) {
          const lidJids = lidContacts.map((c) => c.remoteJid);
          const lidMsgs = await this.prisma.whatsAppMessage.findMany({
            where: { remoteJid: { in: lidJids } },
            orderBy: { timestamp: 'asc' },
            take: 200,
          });
          rawMsgs.push(...lidMsgs);
        }
      }

      waMsgs = rawMsgs.map((m) => {
        const md = m.messageData as any;
        const text =
          md?.conversation ||
          md?.extendedTextMessage?.text ||
          (md?.imageMessage ? `[📷 Photo] ${md.imageMessage.caption || ''}`.trim() : null) ||
          (md?.videoMessage ? `[🎥 Video] ${md.videoMessage.caption || ''}`.trim() : null) ||
          (md?.audioMessage ? '[🎤 Voice message]' : null) ||
          (md?.documentMessage
            ? `[📄 Document: ${md.documentMessage.fileName || 'file'}]`
            : null) ||
          (md?.stickerMessage ? '[🖼️ Sticker]' : null) ||
          (md?.contactMessage ? '[👤 Contact]' : null) ||
          (md?.locationMessage ? '[📍 Location]' : null) ||
          '[Media message]';

        const mediaData = md?.imageMessage?.jpegThumbnail || md?.videoMessage?.jpegThumbnail || null;

        return {
          id: `wa_${m.id}`,
          direction: m.direction === 'INBOUND' ? 'INBOUND' : 'OUTBOUND',
          channel: 'WHATSAPP',
          content: text,
          status: m.status || 'DELIVERED',
          createdAt: m.timestamp,
          mediaData,
        };
      });
    }

    // ── 3. Merge, deduplicate, and sort chronologically ───────────────────────
    const allMsgs = [...activityMsgs, ...waMsgs];

    // Deduplicate: if an activity and a WA message have the same content within 60s, keep the WA one (richer)
    const seen = new Set<string>();
    const deduped = allMsgs
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .filter((m) => {
        // Round timestamp to nearest minute for fuzzy dedup
        const minuteKey = `${m.direction}_${m.content.slice(0, 40)}_${Math.floor(new Date(m.createdAt).getTime() / 60000)}`;
        if (seen.has(minuteKey)) return false;
        seen.add(minuteKey);
        return true;
      });

    return deduped.map((m) => ({
      id: m.id,
      direction: m.direction,
      channel: m.channel,
      content: m.content,
      status: m.status,
      createdAt: m.createdAt,
      mediaData: (m as any).mediaData,
    }));
  }


  @Get('whatsapp/status')
  getWhatsAppStatus() {
    const sessions = this.baileysEngine.getActiveSessions();
    return { activeSessions: sessions, connected: sessions.length > 0 };
  }

  @Post('broadcast')
  async broadcast(
    @Body() body: { phones: string[]; message: string; delayMs?: number },
  ) {
    const results = [];
    for (const phone of body.phones) {
      const result = await this.baileysEngine.sendMessage(phone, body.message);
      results.push({ phone, sent: result.success, messageId: result.messageId });
      if (body.delayMs) await new Promise(r => setTimeout(r, body.delayMs));
    }
    const sent = results.filter(r => r.sent).length;
    return { sent, failed: results.length - sent, results };
  }
}
