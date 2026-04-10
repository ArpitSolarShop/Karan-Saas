import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VendorsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.vendor.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const vendor = await this.prisma.vendor.findFirst({ where: { id, tenantId } });
    if (!vendor) throw new NotFoundException('Vendor not found');
    return vendor;
  }

  async create(data: any) {
    return this.prisma.vendor.create({ data });
  }

  async update(id: string, tenantId: string, data: any) {
    return this.prisma.vendor.update({ where: { id, tenantId }, data });
  }

  async remove(id: string, tenantId: string) {
    return this.prisma.vendor.delete({ where: { id, tenantId } });
  }
}
