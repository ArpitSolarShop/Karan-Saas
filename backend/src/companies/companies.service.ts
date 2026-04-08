import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class CompaniesService {
  constructor(
    private prisma: PrismaService,
    private auditLogs: AuditLogsService,
  ) {}

  async findAll(tenantId: string) {
    return this.prisma.company.findMany({
      where: { tenantId },
      include: {
        _count: {
          select: { deals: true, leads: true, invoices: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async search(tenantId: string, query: string) {
    return this.prisma.company.findMany({
      where: {
        tenantId,
        name: { contains: query, mode: 'insensitive' },
      },
      take: 10,
      select: { id: true, name: true, logo: true, industry: true },
    });
  }

  async findOne(id: string, tenantId: string) {
    const company = await this.prisma.company.findFirst({
      where: { id, tenantId },
      include: {
        leads: {
          where: { deletedAt: null },
          orderBy: { updatedAt: 'desc' },
        },
        deals: { 
          include: { owner: true },
          orderBy: { updatedAt: 'desc' },
        },
        invoices: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    
    if (!company) throw new NotFoundException('Company not found');

    // CRM Intelligence: Calculate total pipeline value dynamically (SuiteCRM/Django-CRM logic)
    const pipelineValue = company.deals
      .filter(d => !['CLOSED_WON', 'CLOSED_LOST'].includes(d.stage.toUpperCase()))
      .reduce((sum, deal) => sum + (deal.value || 0), 0);

    const wonValue = company.deals
      .filter(d => d.stage.toUpperCase() === 'CLOSED_WON')
      .reduce((sum, deal) => sum + (deal.value || 0), 0);

    return {
      ...company,
      metrics: {
        openPipelineValue: pipelineValue,
        totalWonValue: wonValue,
        dealWinRate: company.deals.length > 0 
          ? ((company.deals.filter(d => d.stage.toUpperCase() === 'CLOSED_WON').length / company.deals.length) * 100).toFixed(1) + '%' 
          : '0%'
      }
    };
  }

  async create(createCompanyDto: CreateCompanyDto, userId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: createCompanyDto as any,
      });

      // 200% Feature: Unified Audit Engine
      await this.auditLogs.logChange({
        tenantId: company.tenantId,
        userId: userId || company.createdBy || undefined,
        action: 'COMPANY_CREATED',
        entityType: 'Company',
        entityId: company.id,
        details: { newValues: company },
      });

      return company;
    });
  }

  async update(id: string, tenantId: string, updateCompanyDto: UpdateCompanyDto, userId?: string) {
    const existing = await this.prisma.company.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Company not found');

    return this.prisma.$transaction(async (tx) => {
      const company = await tx.company.update({
        where: { id, tenantId },
        data: updateCompanyDto as any,
      });

      // 200% Feature: Deep-Visibility Snapshots
      await this.auditLogs.logChange({
        tenantId,
        userId: userId || existing.createdBy || undefined,
        action: 'COMPANY_UPDATED',
        entityType: 'Company',
        entityId: id,
        details: { 
          oldValues: existing, 
          newValues: company 
        },
      });

      return company;
    });
  }

  async remove(id: string, tenantId: string) {
    return this.prisma.company.delete({
      where: { id, tenantId },
    });
  }
}
