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
    let leadId = data.leadId;

    // Check if lead exists
    const leadExists = await this.prisma.lead.findUnique({ where: { id: leadId, tenantId: data.tenantId } });

    if (!leadExists) {
      // Fallback: If it's a SheetRow ID, try to find or create the Lead
      const sheetRow = await this.prisma.sheetRow.findUnique({ where: { id: leadId, tenantId: data.tenantId } });
      if (sheetRow) {
        const rowData = sheetRow.data as any;
        const phone = rowData.phone || rowData.phone_primary || rowData.phone_number || null;
        let oldLead;
        if (phone) {
          oldLead = await this.prisma.lead.findFirst({ where: { phone: String(phone), tenantId: data.tenantId } });
        }
        if (!oldLead) {
          oldLead = await this.prisma.lead.create({
            data: {
              tenantId: data.tenantId,
              firstName: rowData.firstName || rowData.name || 'Imported Lead',
              name: rowData.name || rowData.firstName || 'Imported Lead',
              phone: phone ? String(phone) : '',
              email: rowData.email || null,
              status: 'NEW',
              source: 'Spreadsheet Note',
            }
          });
        }
        if (oldLead) {
          leadId = oldLead.id;
        } else {
          throw new Error('Lead not found and could not resolve from Sheet Row.');
        }
      } else {
         throw new Error('Lead not found in this tenant context.');
      }
    }

    const note = await this.prisma.note.create({
      data: {
        tenantId: data.tenantId,
        leadId: leadId,
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
