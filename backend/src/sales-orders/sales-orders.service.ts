import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SalesOrdersService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.salesOrder.findMany({
      where: { tenantId },
      include: { company: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.salesOrder.findUnique({
      where: { id },
      include: { company: { select: { name: true } } },
    });
    if (!order) throw new NotFoundException('Sales order not found');
    return order;
  }

  async create(data: any) {
    return this.prisma.salesOrder.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.salesOrder.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.salesOrder.delete({ where: { id } });
  }
}
