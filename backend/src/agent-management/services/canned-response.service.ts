import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CannedResponseService {
  constructor(private prisma: PrismaService) {}

  async create(data: { shortCode: string; content: string; category?: string; isGlobal?: boolean; userId?: string; tenantId: string }) {
    return this.prisma.cannedResponse.create({ data });
  }

  async findAll(tenantId: string, category?: string) {
    const where: any = { tenantId, isActive: true };
    if (category) where.category = category;
    return this.prisma.cannedResponse.findMany({ where, orderBy: { shortCode: 'asc' } });
  }

  async findOne(id: string) {
    const cr = await this.prisma.cannedResponse.findUnique({ where: { id } });
    if (!cr) throw new NotFoundException(`Canned response ${id} not found`);
    return cr;
  }

  async search(tenantId: string, query: string) {
    return this.prisma.cannedResponse.findMany({
      where: { tenantId, isActive: true, OR: [{ shortCode: { contains: query, mode: 'insensitive' } }, { content: { contains: query, mode: 'insensitive' } }] },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.cannedResponse.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.cannedResponse.update({ where: { id }, data: { isActive: false } });
  }

  async getCategories(tenantId: string) {
    const results = await this.prisma.cannedResponse.findMany({
      where: { tenantId, isActive: true, category: { not: null } },
      select: { category: true }, distinct: ['category'],
    });
    return results.map(r => r.category).filter(Boolean);
  }
}
