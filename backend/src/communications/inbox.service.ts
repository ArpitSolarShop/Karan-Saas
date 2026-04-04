import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InboxService {
  private readonly logger = new Logger(InboxService.name);

  constructor(private prisma: PrismaService) {}

  async getInboxes(tenantId: string) {
    return this.prisma.omniInbox.findMany({
      where: { tenantId },
      include: { _count: { select: { conversations: true } } },
    });
  }

  async createInbox(tenantId: string, data: { name: string; channelType: string; config?: any }) {
    return this.prisma.omniInbox.create({
      data: {
        tenantId,
        name: data.name,
        channelType: data.channelType,
        config: data.config || {},
      },
    });
  }

  /** Find or auto-create an inbox for a channel (e.g. WhatsApp Instance) */
  async getOrCreateInboxForChannel(tenantId: string, channelType: string, externalId: string, name: string) {
    let inbox = await this.prisma.omniInbox.findFirst({
      where: { tenantId, channelType, config: { path: ['externalId'], equals: externalId } }
    });

    if (!inbox) {
      inbox = await this.prisma.omniInbox.create({
        data: {
          tenantId,
          name,
          channelType,
          config: { externalId }
        }
      });
    }
    return inbox;
  }
}
