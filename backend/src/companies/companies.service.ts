import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId?: string) {
    return this.prisma.company.findMany({
      where: tenantId ? { tenantId } : undefined,
      include: {
        _count: {
          select: { deals: true, leads: true, invoices: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        leads: true,
        deals: { include: { owner: true } },
        invoices: true,
      },
    });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async create(data: any) {
    return this.prisma.company.create({
      data: {
        tenantId: data.tenantId,
        name: data.name,
        industry: data.industry,
        sector: data.sector,
        website: data.website,
        phone: data.phone,
        email: data.email,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        zipcode: data.zipcode,
        size: data.size,
        revenue: data.revenue,
        description: data.description,
        createdBy: data.createdBy,
        assignedTo: data.assignedTo,
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.company.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.company.delete({
      where: { id },
    });
  }
}
