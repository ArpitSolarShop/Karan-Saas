import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class NotesService {
  constructor(
    private prisma: PrismaService,
    private auditLogs: AuditLogsService,
  ) {}

  async create(data: { tenantId: string; leadId: string; agentId: string; note: string }, userId?: string) {
    const note = await this.prisma.note.create({
      data: {
        tenantId: data.tenantId,
        leadId: data.leadId,
        agentId: data.agentId,
        note: data.note,
      },
    });

    await this.auditLogs.logChange({
      tenantId: data.tenantId,
      userId: userId || data.agentId,
      action: 'NOTE_CREATED',
      entityType: 'Note',
      entityId: note.id,
      details: { newValues: note },
    });

    return note;
  }

  async findByLead(leadId: string, tenantId: string) {
    return this.prisma.note.findMany({
      where: { leadId, tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        agent: {
          select: { firstName: true, lastName: true },
        },
      },
    });
  }

  async remove(id: string) {
    return this.prisma.note.delete({
      where: { id },
    });
  }
}
