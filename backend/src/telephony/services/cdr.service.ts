import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CdrService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, data: any) {
    return this.prisma.cdr.create({ data });
  }

  async findAll(tenantId: string, filters?: {
    from?: Date; to?: Date; agentId?: string; campaignId?: string;
    direction?: string; disposition?: string; page?: number; limit?: number;
  }) {
    const where: any = { tenantId };
    if (filters?.agentId) where.agentId = filters.agentId;
    if (filters?.campaignId) where.campaignId = filters.campaignId;
    if (filters?.direction) where.direction = filters.direction;
    if (filters?.disposition) where.disposition = filters.disposition;
    if (filters?.from || filters?.to) {
      where.startTime = {};
      if (filters.from) where.startTime.gte = filters.from;
      if (filters.to) where.startTime.lte = filters.to;
    }

    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 50;

    const [records, total] = await Promise.all([
      this.prisma.cdr.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy: { startTime: 'desc' },
      }),
      this.prisma.cdr.count({ where }),
    ]);

    return { records, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(tenantId: string, id: string) {
      return this.prisma.cdr.findFirst({ where: { id, tenantId } });
  }

  async getStats(tenantId: string, from?: Date, to?: Date) {
    const where: any = { tenantId };
    if (from || to) {
      where.startTime = {};
      if (from) where.startTime.gte = from;
      if (to) where.startTime.lte = to;
    }

    const [totalCalls, answered, noAnswer, busy, failed] = await Promise.all([
      this.prisma.cdr.count({ where }),
      this.prisma.cdr.count({ where: { ...where, disposition: 'ANSWERED' } }),
      this.prisma.cdr.count({ where: { ...where, disposition: 'NO ANSWER' } }),
      this.prisma.cdr.count({ where: { ...where, disposition: 'BUSY' } }),
      this.prisma.cdr.count({ where: { ...where, disposition: 'FAILED' } }),
    ]);

    const avgDuration = await this.prisma.cdr.aggregate({
      where: { ...where, disposition: 'ANSWERED' },
      _avg: { duration: true, billableSeconds: true },
      _sum: { cost: true },
    });

    return {
      totalCalls, answered, noAnswer, busy, failed,
      answerRate: totalCalls > 0 ? Math.round((answered / totalCalls) * 100) : 0,
      avgDuration: Math.round(avgDuration._avg.duration ?? 0),
      avgBillable: Math.round(avgDuration._avg.billableSeconds ?? 0),
      totalCost: avgDuration._sum.cost ?? 0,
    };
  }

  async getAgentStats(tenantId: string, agentId: string, from?: Date, to?: Date) {
    const where: any = { tenantId, agentId };
    if (from || to) {
      where.startTime = {};
      if (from) where.startTime.gte = from;
      if (to) where.startTime.lte = to;
    }

    const [total, answered] = await Promise.all([
      this.prisma.cdr.count({ where }),
      this.prisma.cdr.count({ where: { ...where, disposition: 'ANSWERED' } }),
    ]);

    const agg = await this.prisma.cdr.aggregate({
      where: { ...where, disposition: 'ANSWERED' },
      _avg: { duration: true },
      _sum: { duration: true },
    });

    return {
      totalCalls: total, answeredCalls: answered,
      answerRate: total > 0 ? Math.round((answered / total) * 100) : 0,
      avgHandleTime: Math.round(agg._avg.duration ?? 0),
      totalTalkTime: agg._sum.duration ?? 0,
    };
  }
}
