import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DncService {
  constructor(private prisma: PrismaService) {}

  async addEntry(tenantId: string, data: { phone: string; source?: string; reason?: string; campaignId?: string; addedBy?: string }) {
    return this.prisma.dncEntry.upsert({
      where: { tenantId_phone: { tenantId, phone: data.phone } },
      create: { ...data, tenantId },
      update: { source: data.source, reason: data.reason, isActive: true },
    });
  }

  async addBulk(entries: { phone: string; reason?: string }[], tenantId: string, addedBy?: string) {
    const results = { added: 0, skipped: 0, errors: 0 };
    for (const entry of entries) {
      try {
        await this.addEntry(tenantId, { phone: entry.phone, reason: entry.reason, source: 'BULK_IMPORT', addedBy });
        results.added++;
      } catch { results.skipped++; }
    }
    return results;
  }

  async checkPhone(phone: string, tenantId: string): Promise<{ isDnc: boolean; entry?: any }> {
    const entry = await this.prisma.dncEntry.findUnique({
      where: { tenantId_phone: { tenantId, phone } },
    });
    return { isDnc: !!entry && entry.isActive, entry };
  }

  async checkPhones(phones: string[], tenantId: string): Promise<Record<string, boolean>> {
    const entries = await this.prisma.dncEntry.findMany({
      where: { tenantId, phone: { in: phones }, isActive: true },
      select: { phone: true },
    });
    const dncSet = new Set(entries.map(e => e.phone));
    const result: Record<string, boolean> = {};
    phones.forEach(p => { result[p] = dncSet.has(p); });
    return result;
  }

  async findAll(tenantId: string, page = 1, limit = 50, search?: string) {
    const where: any = { tenantId };
    if (search) where.phone = { contains: search };

    const [records, total] = await Promise.all([
      this.prisma.dncEntry.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.dncEntry.count({ where }),
    ]);
    return { records, total, page, limit };
  }

  async remove(tenantId: string, id: string) {
      return this.prisma.dncEntry.update({ where: { id, tenantId }, data: { isActive: false } });
  }

  async hardDelete(tenantId: string, id: string) {
      return this.prisma.dncEntry.delete({ where: { id, tenantId } });
  }

  async getStats(tenantId: string) {
    const [total, active, manual, imported] = await Promise.all([
      this.prisma.dncEntry.count({ where: { tenantId } }),
      this.prisma.dncEntry.count({ where: { tenantId, isActive: true } }),
      this.prisma.dncEntry.count({ where: { tenantId, source: 'MANUAL' } }),
      this.prisma.dncEntry.count({ where: { tenantId, source: 'BULK_IMPORT' } }),
    ]);
    return { total, active, manual, imported };
  }
}
