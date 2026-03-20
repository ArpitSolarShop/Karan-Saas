import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async createTicket(tenantId: string, data: any) {
    return this.prisma.ticket.create({
      data: {
        tenantId,
        subject: data.subject,
        description: data.description,
        priority: data.priority || 'MEDIUM',
        leadId: data.leadId,
        assignedTo: data.assignedTo,
      },
    });
  }

  async getTickets(tenantId: string) {
    return this.prisma.ticket.findMany({
      where: { tenantId },
      include: { agent: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateTicket(id: string, tenantId: string, data: any) {
    const ticket = await this.prisma.ticket.findFirst({ where: { id, tenantId } });
    if (!ticket) throw new NotFoundException('Ticket not found');

    const updateData: any = { ...data };
    if (data.status === 'RESOLVED' || data.status === 'CLOSED') {
      updateData.resolvedAt = new Date();
    }

    return this.prisma.ticket.update({
      where: { id },
      data: updateData,
    });
  }

  async addMessage(ticketId: string, senderId: string | null, body: string, isInternal: boolean) {
    return this.prisma.ticketMessage.create({
      data: { ticketId, senderId, body, isInternal },
    });
  }
}
