import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as XLSX from 'xlsx';

@Injectable()
export class CampaignContactsService {
  constructor(private prisma: PrismaService) {}

  async createList(data: { name: string; campaignId: string; tenantId: string; description?: string }) {
    return this.prisma.campaignContactList.create({ data, include: { _count: { select: { contacts: true } } } });
  }

  async findLists(campaignId: string) {
    return this.prisma.campaignContactList.findMany({
      where: { campaignId },
      include: { _count: { select: { contacts: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteList(id: string) {
    return this.prisma.campaignContactList.delete({ where: { id } });
  }

  async importFromBuffer(listId: string, buffer: Buffer) {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data: any[] = XLSX.utils.sheet_to_json(sheet);

    // Map common headers to schema fields
    const contacts = data.map(row => ({
      firstName: row.firstName || row.first_name || row.FirstName || '',
      lastName: row.lastName || row.last_name || row.LastName || '',
      phone: String(row.phone || row.phone_number || row.Phone || row.mobile || ''),
      phoneAlt: String(row.phoneAlt || row.phone_alt || row.mobile_alt || ''),
      email: row.email || row.Email || '',
      company: row.company || row.Company || row.organization || '',
      customData: row,
    })).filter(c => c.phone); // Require at least a phone number

    return this.importContacts(listId, contacts);
  }

  async importContacts(listId: string, contacts: { firstName?: string; lastName?: string; phone: string; phoneAlt?: string; email?: string; company?: string; customData?: any }[]) {
    const results = { imported: 0, errors: 0 };
    for (const contact of contacts) {
      try {
        await this.prisma.campaignContact.create({ data: { ...contact, listId } });
        results.imported++;
      } catch { results.errors++; }
    }
    // Update list counts
    const total = await this.prisma.campaignContact.count({ where: { listId } });
    await this.prisma.campaignContactList.update({ where: { id: listId }, data: { totalCount: total, activeCount: total } });
    return results;
  }

  async findContacts(listId: string, page = 1, limit = 50, status?: string) {
    const where: any = { listId };
    if (status) where.status = status;

    const [records, total] = await Promise.all([
      this.prisma.campaignContact.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.campaignContact.count({ where }),
    ]);
    return { records, total, page, limit };
  }

  async updateContact(id: string, data: any) {
    return this.prisma.campaignContact.update({ where: { id }, data });
  }

  async deleteContact(id: string) {
    return this.prisma.campaignContact.delete({ where: { id } });
  }

  async getContactStats(campaignId: string) {
    const lists = await this.prisma.campaignContactList.findMany({
      where: { campaignId },
      select: { id: true },
    });
    const listIds = lists.map(l => l.id);
    if (listIds.length === 0) return { total: 0, pending: 0, completed: 0, failed: 0, dnc: 0 };

    const [total, pending, completed, failed, dnc] = await Promise.all([
      this.prisma.campaignContact.count({ where: { listId: { in: listIds } } }),
      this.prisma.campaignContact.count({ where: { listId: { in: listIds }, status: 'PENDING' } }),
      this.prisma.campaignContact.count({ where: { listId: { in: listIds }, status: 'COMPLETED' } }),
      this.prisma.campaignContact.count({ where: { listId: { in: listIds }, status: 'FAILED' } }),
      this.prisma.campaignContact.count({ where: { listId: { in: listIds }, isDnc: true } }),
    ]);
    return { total, pending, completed, failed, dnc };
  }
}
