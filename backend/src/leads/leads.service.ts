import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Lead, LeadStatus } from '@prisma/client';
import { LeadsGateway } from './leads.gateway';
import { ActivitiesService } from '../activities/activities.service';
import { SearchService } from '../search/search.service';
import { AuditService } from '../audit/audit.service';

const DEV_TENANT_ID = 'dev-tenant-001';

@Injectable()
export class LeadsService {
  constructor(
    private prisma: PrismaService,
    private leadsGateway: LeadsGateway,
    private activities: ActivitiesService,
    private search: SearchService,
    private audit: AuditService,
  ) { }

  private async ensureDevTenant(): Promise<string> {
    const existing = await this.prisma.tenant.findUnique({
      where: { id: DEV_TENANT_ID },
    });
    if (!existing) {
      await this.prisma.tenant.create({
        data: {
          id: DEV_TENANT_ID,
          name: 'Alpha Development',
          subdomain: 'dev',
          plan: 'STARTER',
          maxAgents: 100,
        },
      });
    }
    return DEV_TENANT_ID;
  }

  async findAll() {
    return this.prisma.lead.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.lead.findUnique({
      where: { id },
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
    const tenantId = await this.ensureDevTenant();
    const lead = await this.prisma.lead.create({
      data: {
        tenantId,
        firstName: data.firstName || data.name || 'Unknown',
        lastName: data.lastName || null,
        name: data.name || data.firstName || 'Unknown',
        phone: data.phone || '',
        phoneSecondary: data.phoneSecondary || null,
        email: data.email || null,
        company: data.company || null,
        source: data.source || null,
        status: data.status || LeadStatus.NEW,
        score: data.score || 0,
        priority: data.priority || 1,
        city: data.city || null,
        state: data.state || null,
        tags: data.tags || [],
        customFields: data.customFields || {},
      },
    });
    this.leadsGateway.broadcastUpdate('leadCreated', lead);
    await this.activities.log(
      lead.id,
      'SYSTEM',
      'LEAD_CREATED',
      `Lead ${lead.name} was created.`,
    );
    await this.search.indexLead(lead);
    await this.audit.record({
      tenantId: lead.tenantId,
      entityType: 'LEAD',
      entityId: lead.id,
      action: 'CREATE',
      newValues: lead,
    });
    return lead;
  }

  async update(id: string, data: any) {
    const lead = await this.prisma.lead.update({ where: { id }, data });
    this.leadsGateway.broadcastUpdate('leadUpdated', lead);
    await this.activities.log(
      id,
      'SYSTEM',
      'LEAD_UPDATED',
      `Lead updated. Status: ${lead.status}`,
    );
    await this.search.indexLead(lead);
    await this.audit.record({
      tenantId: lead.tenantId,
      entityType: 'LEAD',
      entityId: lead.id,
      action: 'UPDATE',
      newValues: lead,
    });
    return lead;
  }

  async remove(id: string) {
    const lead = await this.prisma.lead.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    this.leadsGateway.broadcastUpdate('leadDeleted', { id });
    await this.search.deleteLeadFromIndex(id);
    await this.audit.record({
      tenantId: lead.tenantId,
      entityType: 'LEAD',
      entityId: id,
      action: 'DELETE',
      oldValues: lead,
    });
    return lead;
  }

  // ── Import ─────────────────────────────────────────────────────────────────

  async importLeads(buffer: Buffer, filename: string, mimetype: string) {
    const tenantId = await this.ensureDevTenant();
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
      } catch {
        throw new Error('Failed to parse Excel/CSV file.');
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

  async getImportHistory() {
    return this.prisma.leadList.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  // ── Export CSV ─────────────────────────────────────────────────────────────

  async exportCsv(filters?: {
    status?: string;
    assignedTo?: string;
    tags?: string[];
  }): Promise<string> {
    const where: any = { deletedAt: null };
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
        l.company || '',
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
    action: 'assign' | 'tag' | 'delete' | 'status',
    ids: string[],
    value?: any,
  ) {
    if (action === 'assign') {
      await this.prisma.lead.updateMany({
        where: { id: { in: ids } },
        data: { assignedTo: value },
      });
      return { updated: ids.length };
    }
    if (action === 'status') {
      await this.prisma.lead.updateMany({
        where: { id: { in: ids } },
        data: { status: value },
      });
      return { updated: ids.length };
    }
    if (action === 'tag') {
      for (const id of ids) {
        const lead = await this.prisma.lead.findUnique({ where: { id } });
        if (!lead) continue;
        const merged = Array.from(
          new Set([...(lead.tags || []), ...((value as string[]) || [])]),
        );
        await this.prisma.lead.update({
          where: { id },
          data: { tags: merged },
        });
      }
      return { updated: ids.length };
    }
    if (action === 'delete') {
      await this.prisma.lead.updateMany({
        where: { id: { in: ids } },
        data: { deletedAt: new Date() },
      });
      for (const id of ids) {
        try {
          await this.search.deleteLeadFromIndex(id);
        } catch { }
      }
      return { deleted: ids.length };
    }
    throw new Error(`Unknown bulk action: ${action}`);
  }

  // ── Tag management ─────────────────────────────────────────────────────────

  async addTag(id: string, tag: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) throw new Error('Lead not found');
    const tags = Array.from(new Set([...(lead.tags || []), tag]));
    return this.prisma.lead.update({ where: { id }, data: { tags } });
  }

  async removeTag(id: string, tag: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) throw new Error('Lead not found');
    const tags = (lead.tags || []).filter((t) => t !== tag);
    return this.prisma.lead.update({ where: { id }, data: { tags } });
  }
}
