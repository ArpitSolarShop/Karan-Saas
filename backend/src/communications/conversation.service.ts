import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CommunicationsGateway } from './communications.gateway';

@Injectable()
export class ConversationService {
  private readonly logger = new Logger(ConversationService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => CommunicationsGateway))
    private gateway: CommunicationsGateway,
  ) {}

  /**
   * Find or create a conversation for a contact in a specific inbox.
   */
  async findOrCreateConversation(
    tenantId: string,
    inboxId: string,
    remoteJid: string,
    leadId?: string,
  ) {
    let conversation = await this.prisma.omniConversation.findFirst({
      where: {
        tenantId,
        inboxId,
        metadata: { path: ['remoteJid'], equals: remoteJid },
      },
    });

    if (!conversation) {
      // Try to find lead by phone/email if not provided
      let finalLeadId = leadId;
      if (!finalLeadId) {
        const lead = await this.prisma.lead.findFirst({
          where: { tenantId, phone: remoteJid.split('@')[0] },
        });
        if (lead) finalLeadId = lead.id;
      }

      conversation = await this.prisma.omniConversation.create({
        data: {
          tenantId,
          inboxId,
          contactId: finalLeadId,
          metadata: { remoteJid },
          status: 'OPEN',
        },
      });
      this.logger.log(`Created new conversation ${conversation.id} for ${remoteJid}`);
    }

    return conversation;
  }

  /**
   * Add a message to a conversation and update the lastMessageAt timestamp.
   */
  async addMessage(
    tenantId: string,
    conversationId: string,
    data: {
      inboxId: string;
      direction: 'INBOUND' | 'OUTBOUND';
      content?: string;
      contentType?: string;
      senderId?: string;
      externalId?: string;
      metadata?: any;
    },
  ) {
    const conversation = await this.prisma.omniConversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) throw new Error('Conversation not found');

    const message = await this.prisma.omniMessage.create({
      data: {
        tenantId,
        conversationId,
        inboxId: data.inboxId,
        contactId: conversation.contactId,
        senderId: data.senderId,
        direction: data.direction,
        content: data.content,
        contentType: data.contentType || 'text',
        externalId: data.externalId,
        metadata: data.metadata || {},
      },
      include: { contact: true, sender: { select: { firstName: true, lastName: true } } }
    });

    // Update conversation timestamp and status if inbound
    const updatedConversation = await this.prisma.omniConversation.update({
      where: { id: conversationId },
      data: { 
        lastMessageAt: new Date(),
        status: data.direction === 'INBOUND' ? 'OPEN' : undefined // Re-open on incoming
      },
      include: { contact: true, assignee: true, inbox: true }
    });

    // Emit real-time update
    this.gateway.emitMessageUpdate(tenantId, conversationId, message);
    this.gateway.emitConversationUpdate(tenantId, updatedConversation);

    return message;
  }

  async getConversations(tenantId: string, inboxId?: string) {
    return this.prisma.omniConversation.findMany({
      where: { 
        tenantId,
        inboxId: inboxId || undefined,
      },
      include: {
        contact: true,
        assignee: { select: { id: true, firstName: true, lastName: true } },
        inbox: true,
        messages: {
          take: 1,
          orderBy: { timestamp: 'desc' },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });
  }

  async getMessages(conversationId: string, limit = 50) {
    return this.prisma.omniMessage.findMany({
      where: { conversationId },
      orderBy: { timestamp: 'asc' },
      take: limit,
    });
  }
}
