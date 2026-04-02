import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DealsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.deal.create({ data });
  }

  async findAll(tenantId?: string) {
    return this.prisma.deal.findMany({
      where: tenantId ? { tenantId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        owner: { select: { firstName: true, lastName: true } },
        lead: { select: { firstName: true, name: true } },
      },
    });
  }

  async findOne(id: string) {
    const deal = await this.prisma.deal.findUnique({
      where: { id },
      include: {
        owner: { select: { firstName: true, lastName: true } },
        lead: true,
      },
    });
    if (!deal) throw new NotFoundException('Deal not found');
    return deal;
  }

  async update(id: string, data: any) {
    return this.prisma.deal.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.deal.delete({ where: { id } });
  }
}
