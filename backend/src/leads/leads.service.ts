import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Lead, LeadStatus } from '@prisma/client';
import { LeadsGateway } from './leads.gateway';
import { ActivitiesService } from '../activities/activities.service';
import { SearchService } from '../search/search.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { DedupeService } from './services/dedupe.service';

// Production-ready service strictly scoped by tenant context.

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    private prisma: PrismaService,
    private leadsGateway: LeadsGateway,
    private activities: ActivitiesService,
    private search: SearchService,
    private auditLogs: AuditLogsService,
    private dedupe: DedupeService,
  ) { }

  // Strict isolation check
  private async validateTenant(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new Error('Enterprise tenant mismatch or unauthorized access.');
  }

  async findAll(tenantId: string) {
    return this.prisma.lead.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    return this.prisma.lead.findUnique({
      where: { id, tenantId },
      include: {
        calls: { orderBy: { createdAt: 'desc' }, take: 20 },
        followups: true,
        notes: { orderBy: { createdAt: 'desc' }, take: 20 },
        activities: { orderBy: { createdAt: 'desc' }, take: 50 },
        callbacks: { orderBy: { scheduledAt: 'asc' } },
        tasks: { orderBy: { dueDate: 'asc' } },
        deals: true,
      },
    });
  }

  async create(data: any) {
    const tenantId = data.tenantId;
    if (!tenantId) throw new Error('Tenant identification required for lead creation.');

    // 1. 200% Feature: Pre-creation Dedupe check
    if (data.phone) {
      const existing = await this.dedupe.getDuplicatesByPhone(tenantId, data.phone);
      if (existing.length > 0) {
        // We log it, but allow if forced, or throw error depending on enterprise policy
        // For now, let's flag it in metadata
        data.customFields = { ...data.customFields, duplicateFlag: true, duplicateOf: existing[0].id };
      }
    }

    const lead = await this.prisma.lead.create({
      data: {
        tenantId,
        firstName: data.firstName || data.name || 'Unknown',
        lastName: data.lastName || null,
        name: data.name || data.firstName || 'Unknown',
        phone: data.phone || '',
        phoneSecondary: data.phoneSecondary || null,
        email: data.email || null,
        companyName: data.companyName || data.company || null,
        source: data.source || null,
        status: data.status || LeadStatus.NEW,
        score: data.score || 0,
        priority: data.priority || 1,
        city: data.city || null,
        state: data.state || null,
        companyId: data.companyId || null,
        tags: data.tags || [],
        customFields: data.customFields || {},
      },
    });
    this.leadsGateway.broadcastUpdate('leadCreated', lead);
    await this.activities.log(
      lead.tenantId,
      lead.id,
      'SYSTEM',
      'LEAD_CREATED',
      `Lead ${lead.name} was created.`,
    );
    await this.search.indexLead(lead);

    // 2. 200% Feature: Advanced Audit Logging
    await this.auditLogs.logChange({
      tenantId: lead.tenantId,
      entityType: 'LEAD',
      entityId: lead.id,
      action: 'CREATE',
      details: { newValues: lead },
    });
    return lead;
  }

  async update(originalId: string, tenantId: string, data: any) {
    let oldLead = await this.prisma.lead.findUnique({ where: { id: originalId, tenantId } });
    let id = originalId;

    if (!oldLead) {
      // Fallback: If it's a SheetRow ID, try to find or create the Lead
      const sheetRow = await this.prisma.sheetRow.findUnique({ where: { id: originalId, tenantId } });
      if (sheetRow) {
        const rowData = sheetRow.data as any;
        const phone = rowData.phone || rowData.phone_primary || rowData.phone_number || null;
        if (phone) {
          oldLead = await this.prisma.lead.findFirst({ where: { phone: String(phone), tenantId } });
        }
        if (!oldLead) {
          oldLead = await this.create({
            tenantId,
            name: rowData.name || 'Imported Lead',
            phone: phone ? String(phone) : '',
            email: rowData.email || null,
            status: data.status || 'NEW',
            source: 'Spreadsheet Update',
            score: data.score || 0,
          });
        }
        if (oldLead) {
          id = oldLead.id;
        } else {
          throw new Error('Lead not found and could not resolve from Sheet Row.');
        }
      } else {
        throw new Error('Lead not found in this tenant context.');
      }
    }
    const lead = await this.prisma.lead.update({ where: { id, tenantId }, data });
    
    this.leadsGateway.broadcastUpdate('leadUpdated', lead);
    await this.activities.log(
      lead.tenantId,
      id,
      'SYSTEM',
      'LEAD_UPDATED',
      `Lead updated. Status: ${lead.status}`,
    );
    await this.search.indexLead(lead);

    // 2. 200% Feature: Advanced Audit Logging (with comparison)
    await this.auditLogs.logChange({
      tenantId: lead.tenantId,
      entityType: 'LEAD',
      entityId: lead.id,
      action: 'UPDATE',
      details: { oldValues: oldLead, newValues: lead },
    });
    return lead;
  }

  async remove(id: string, tenantId: string) {
    const oldLead = await this.prisma.lead.findUnique({ where: { id, tenantId } });
    if (!oldLead) throw new Error('Lead not found in this tenant context.');
    const lead = await this.prisma.lead.update({
      where: { id, tenantId },
      data: { deletedAt: new Date() },
    });
    this.leadsGateway.broadcastUpdate('leadDeleted', { id });
    await this.search.deleteLeadFromIndex(id);

    // 2. 200% Feature: Advanced Audit Logging
    await this.auditLogs.logChange({
      tenantId: lead.tenantId,
      entityType: 'LEAD',
      entityId: id,
      action: 'DELETE',
      details: { oldValues: oldLead },
    });
    return lead;
  }

  // ── Import ─────────────────────────────────────────────────────────────────

  async importLeads(tenantId: string, buffer: Buffer, filename: string, mimetype: string) {
    let rawData: any[] = [];

    if (filename.endsWith('.md')) {
      const content = buffer.toString('utf8');
      const tableRows = content
        .split('\n')
        .filter((line) => line.trim().startsWith('|'));
      if (tableRows.length > 2) {
        const headers = tableRows[0]
          .split('|')
          .map((h) => h.trim().toLowerCase())
          .filter((h) => h);
        for (let i = 2; i < tableRows.length; i++) {
          const cells = tableRows[i]
            .split('|')
            .map((c) => c.trim())
            .filter((_, index, arr) => index > 0 && index < arr.length - 1);
          if (cells.length === headers.length) {
            const rowObj: any = {};
            headers.forEach((h, idx) => {
              rowObj[h] = cells[idx];
            });
            rawData.push(rowObj);
          }
        }
      }
    } else {
      try {
        const xlsx = require('xlsx');
        const workbook = xlsx.read(buffer, { type: 'buffer' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        rawData = xlsx.utils.sheet_to_json(worksheet, { defval: '' });
      } catch (err: any) {
        throw new Error(`Failed to parse Excel/CSV file: ${err.message}`);
      }
    }

    const leadsToInsert: any[] = [];
    let skipped = 0;
    for (const row of rawData) {
      const nameKey = Object.keys(row).find((k) =>
        k.toLowerCase().includes('name'),
      );
      const name = nameKey ? row[nameKey] : null;
      const phoneKey = Object.keys(row).find(
        (k) =>
          k.toLowerCase().includes('phone') ||
          k.toLowerCase().includes('mobile'),
      );
      const phone = phoneKey ? String(row[phoneKey]) : null;
      if (!name || !phone) {
        skipped++;
        continue;
      }
      const emailKey = Object.keys(row).find((k) =>
        k.toLowerCase().includes('email'),
      );
      const sourceKey = Object.keys(row).find((k) =>
        k.toLowerCase().includes('source'),
      );
      leadsToInsert.push({
        tenantId,
        firstName: name,
        name,
        phone,
        email: emailKey ? String(row[emailKey]) : null,
        source: sourceKey ? String(row[sourceKey]) : 'File Import',
        status: LeadStatus.NEW,
        priority: 1,
      });
    }

    if (leadsToInsert.length === 0)
      return { success: false, message: 'No valid leads found.' };
    await this.prisma.lead.createMany({
      data: leadsToInsert,
      skipDuplicates: true,
    });
    this.leadsGateway.broadcastUpdate('leadsImported', {
      count: leadsToInsert.length,
    });
    return {
      success: true,
      message: `Imported ${leadsToInsert.length} leads.`,
      skipped,
    };
  }

  async getImportHistory(tenantId: string) {
    return this.prisma.leadList.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  // ── Export CSV ─────────────────────────────────────────────────────────────

  async exportCsv(
    tenantId: string,
    filters?: {
      status?: string;
      assignedTo?: string;
      tags?: string[];
    },
  ): Promise<string> {
    const where: any = { tenantId, deletedAt: null };
    if (filters?.status) where.status = filters.status;
    if (filters?.assignedTo) where.assignedTo = filters.assignedTo;
    if (filters?.tags?.length) where.tags = { hasSome: filters.tags };

    const leads = await this.prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50_000,
    });
    const header =
      'id,name,phone,email,company,status,source,score,tags,city,state,assignedTo,createdAt';
    const lines = leads.map((l) =>
      [
        l.id,
        l.name || `${l.firstName} ${l.lastName || ''}`.trim(),
        l.phone,
        l.email || '',
        l.companyName || '',
        l.status,
        l.source || '',
        l.score,
        (l.tags || []).join(';'),
        l.city || '',
        l.state || '',
        l.assignedTo || '',
        l.createdAt.toISOString(),
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(','),
    );
    return [header, ...lines].join('\n');
  }

  // ── Bulk Actions ──────────────────────────────────────────────────────────

  async bulkAction(
    tenantId: string,
    action: 'assign' | 'tag' | 'delete' | 'status',
    ids: string[],
    value?: any,
  ) {
    if (action === 'assign') {
      await this.prisma.lead.updateMany({
        where: { id: { in: ids }, tenantId },
        data: { assignedTo: value },
      });
      return { updated: ids.length };
    }
    if (action === 'status') {
      await this.prisma.lead.updateMany({
        where: { id: { in: ids }, tenantId },
        data: { status: value },
      });
      return { updated: ids.length };
    }
    if (action === 'tag') {
      for (const id of ids) {
        const lead = await this.prisma.lead.findUnique({ where: { id, tenantId } });
        if (!lead) continue;
        const merged = Array.from(
          new Set([...(lead.tags || []), ...((value as string[]) || [])]),
        );
        await this.prisma.lead.update({
          where: { id, tenantId },
          data: { tags: merged },
        });
      }
      return { updated: ids.length };
    }
    if (action === 'delete') {
      await this.prisma.lead.updateMany({
        where: { id: { in: ids }, tenantId },
        data: { deletedAt: new Date() },
      });
      for (const id of ids) {
        try {
          await this.search.deleteLeadFromIndex(id);
        } catch (err: any) {
          this.logger.warn(`Failed to delete lead from search index: ${err.message}`);
        }
      }
      return { deleted: ids.length };
    }
    throw new Error(`Unknown bulk action: ${action}`);
  }

  // ── Tag management ─────────────────────────────────────────────────────────

  async addTag(id: string, tenantId: string, tag: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id, tenantId } });
    if (!lead) throw new Error('Lead not found in this tenant context.');
    const tags = Array.from(new Set([...(lead.tags || []), tag]));
    return this.prisma.lead.update({ where: { id, tenantId }, data: { tags } });
  }

  async removeTag(id: string, tenantId: string, tag: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id, tenantId } });
    if (!lead) throw new Error('Lead not found in this tenant context.');
    const tags = (lead.tags || []).filter((t) => t !== tag);
    return this.prisma.lead.update({ where: { id, tenantId }, data: { tags } });
  }
}
