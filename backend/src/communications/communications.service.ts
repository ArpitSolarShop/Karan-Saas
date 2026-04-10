import { Injectable, NotFoundException } from '@nestjs/common';
import { LeadsService } from '../leads/leads.service';
import { ActivitiesService } from '../activities/activities.service';
import { WhatsAppService } from './providers/whatsapp.service';
import { EmailService } from './providers/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConversationService } from './conversation.service';
import { InboxService } from './inbox.service';

@Injectable()
export class CommunicationsService {
  constructor(
    private prisma: PrismaService,
    private leadsService: LeadsService,
    private activities: ActivitiesService,
    private whatsapp: WhatsAppService,
    private email: EmailService,
    private conversationService: ConversationService,
    private inboxService: InboxService,
  ) {}

  async sendCommunication(
    tenantId: string,
    id: string,
    type: 'WHATSAPP' | 'SMS' | 'EMAIL',
    message: string,
    userId: string,
  ) {
    let lead: any = await this.leadsService.findOne(id, tenantId);
    let targetLeadId = id;

    // If lead not found by ID, it might be a SheetRow ID
    if (!lead) {
      const sheetRow = await this.prisma.sheetRow.findFirst({
        where: { id, tenantId },
      });

      if (!sheetRow) {
        throw new NotFoundException(
          'Communication target (Lead or Sheet Row) not found',
        );
      }

      const rowData = sheetRow.data as any;
      const phone =
        rowData.phone || rowData.phone_primary || rowData.phone_number;
      const email = rowData.email;

      // Try finding an existing lead by phone
      if (phone) {
        const existingLead = await this.prisma.lead.findFirst({
          where: { phone: String(phone), tenantId },
        });

        if (existingLead) {
          lead = existingLead;
          targetLeadId = lead.id;
        } else {
          // AUTO-CONVERT: Create a new Lead from the SheetRow data
          lead = await this.leadsService.create({
            tenantId,
            name: rowData.name || 'Sheet Lead',
            phone: String(phone),
            email: email || null,
            status: 'NEW',
            source: 'Spreadsheet Chat',
          });
          targetLeadId = lead.id;
        }
      }
    }

    if (!lead) {
      throw new NotFoundException(
        'Could not resolve contact information from target',
      );
    }

    let success = false;
    let target = '';

    switch (type) {
      case 'WHATSAPP':
        target = lead.phone;
        const waResult = await this.whatsapp.sendMessage(target, message, tenantId);
        success = waResult.success;
        break;
      case 'EMAIL':
        target = lead.email || '';
        if (!target) throw new Error('Lead has no email configured');
        success = await this.email.sendEmail(
          target,
          `Message from Alpha CRM`,
          message,
        );
        break;
      case 'SMS':
        target = lead.phone;
        const smsResult = await this.whatsapp.sendMessage(target, `[SMS] ${message}`, tenantId);
        success = smsResult.success;
        break;
    }

    if (success) {
      // Resolve a real userId — FK constraint requires a valid User record
      let resolvedUserId = userId;
      if (userId === 'SYSTEM' || !userId) {
        const firstUser = await this.prisma.user.findFirst({
          select: { id: true },
        });
        resolvedUserId = firstUser?.id ?? userId;
      } else {
        const userExists = await this.prisma.user.findUnique({
          where: { id: userId },
          select: { id: true },
        });
        if (!userExists) {
          const firstUser = await this.prisma.user.findFirst({
            select: { id: true },
          });
          resolvedUserId = firstUser?.id ?? userId;
        }
      }

      if (resolvedUserId && resolvedUserId !== 'SYSTEM') {
        await this.activities.log(
          lead.tenantId,
          targetLeadId,
          resolvedUserId,
          type,
          `Sent ${type} to ${target}: ${message}`,
        );
      }

      // Sync into Omnichannel Inbox
      try {
        const inbox = await this.inboxService.getOrCreateInboxForChannel(
          lead.tenantId,
          type,
          'default',
          `${type} Inbox`
        );

        const conversation = await this.conversationService.findOrCreateConversation(
          lead.tenantId,
          inbox.id,
          target,
          targetLeadId
        );

        await this.conversationService.addMessage(
          lead.tenantId,
          conversation.id,
          {
            inboxId: inbox.id,
            direction: 'OUTBOUND',
            content: message,
            contentType: 'text',
            senderId: resolvedUserId && resolvedUserId !== 'SYSTEM' ? resolvedUserId : undefined,
          }
        );
      } catch (e) {
        // Just log, don't fail the message send if sync fails
      }
    }

    return { success, type, target, leadId: targetLeadId };
  }
}
