import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

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

  async create(createCompanyDto: CreateCompanyDto) {
    return this.prisma.company.create({
      data: {
        ...createCompanyDto,
      },
    });
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto) {
    return this.prisma.company.update({
      where: { id },
      data: updateCompanyDto,
    });
  }

  async remove(id: string) {
    return this.prisma.company.delete({
      where: { id },
    });
  }
}
