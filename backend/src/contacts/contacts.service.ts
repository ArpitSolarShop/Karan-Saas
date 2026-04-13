import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    tenantId: string;
    firstName: string;
    lastName?: string;
    name?: string;
    phone: string;
    contactNumbers?: any;
    email?: string;
    emails?: any;
    title?: string;
    department?: string;
    source?: string;
    lifecycle?: string;
    score?: number;
    assignedTo?: string;
    customFields?: any;
    tags?: string[];
    city?: string;
    state?: string;
    country?: string;
    description?: string;
    linkedinUrl?: string;
    companyId?: string;
    convertedFromId?: string;
    convertedAt?: Date;
  }) {
    return this.prisma.contact.create({
      data: {
        tenantId: data.tenantId,
        firstName: data.firstName,
        lastName: data.lastName,
        name: data.name || `${data.firstName} ${data.lastName || ''}`.trim(),
        phone: data.phone,
        contactNumbers: data.contactNumbers || [],
        email: data.email,
        emails: data.emails || [],
        title: data.title,
        department: data.department,
        source: data.source,
        lifecycle: data.lifecycle || 'CUSTOMER',
        score: data.score || 0,
        assignedTo: data.assignedTo,
        customFields: data.customFields || {},
        tags: data.tags || [],
        city: data.city,
        state: data.state,
        country: data.country || 'IN',
        description: data.description,
        linkedinUrl: data.linkedinUrl,
        companyId: data.companyId,
        convertedFromId: data.convertedFromId,
        convertedAt: data.convertedAt,
      },
      include: { company: true, convertedFrom: true },
    });
  }

  async findAll(tenantId: string, query?: { search?: string; lifecycle?: string; companyId?: string }) {
    const where: any = { tenantId, deletedAt: null };
    if (query?.lifecycle) where.lifecycle = query.lifecycle;
    if (query?.companyId) where.companyId = query.companyId;
    if (query?.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { name: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.contact.findMany({
      where,
      include: { company: true, assignedUser: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const contact = await this.prisma.contact.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        company: true,
        convertedFrom: true,
        assignedUser: true,
        deals: true,
        notes: { include: { agent: true }, orderBy: { createdAt: 'desc' } },
        activities: { include: { user: true }, orderBy: { createdAt: 'desc' } },
        calls: { orderBy: { createdAt: 'desc' }, take: 20 },
        tasks: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!contact) throw new NotFoundException('Contact not found');
    return contact;
  }

  async update(id: string, tenantId: string, data: any) {
    const contact = await this.prisma.contact.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!contact) throw new NotFoundException('Contact not found');
    return this.prisma.contact.update({
      where: { id },
      data,
      include: { company: true },
    });
  }

  async remove(id: string, tenantId: string) {
    const contact = await this.prisma.contact.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!contact) throw new NotFoundException('Contact not found');
    return this.prisma.contact.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async addTag(id: string, tenantId: string, tag: string) {
    const contact = await this.prisma.contact.findFirst({ where: { id, tenantId } });
    if (!contact) throw new NotFoundException('Contact not found');
    const tags = contact.tags.includes(tag) ? contact.tags : [...contact.tags, tag];
    return this.prisma.contact.update({ where: { id }, data: { tags } });
  }

  async removeTag(id: string, tenantId: string, tag: string) {
    const contact = await this.prisma.contact.findFirst({ where: { id, tenantId } });
    if (!contact) throw new NotFoundException('Contact not found');
    return this.prisma.contact.update({
      where: { id },
      data: { tags: contact.tags.filter((t) => t !== tag) },
    });
  }

  async checkDuplicate(tenantId: string, phone?: string, email?: string) {
    const conditions: any[] = [];
    if (phone) conditions.push({ phone, tenantId });
    if (email) conditions.push({ email, tenantId });
    if (conditions.length === 0) return null;
    return this.prisma.contact.findFirst({
      where: { OR: conditions, deletedAt: null },
      include: { company: true },
    });
  }
}
