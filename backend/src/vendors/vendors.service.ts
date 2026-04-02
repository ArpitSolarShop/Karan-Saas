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

  async findOne(id: string) {
    const vendor = await this.prisma.vendor.findUnique({ where: { id } });
    if (!vendor) throw new NotFoundException('Vendor not found');
    return vendor;
  }

  async create(data: any) {
    return this.prisma.vendor.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.vendor.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.vendor.delete({ where: { id } });
  }
}
