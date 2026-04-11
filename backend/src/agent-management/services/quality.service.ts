import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class QualityService {
  constructor(private prisma: PrismaService) {}

  // Quality Forms
  async createForm(tenantId: string, data: { name: string; description?: string; sections?: any; maxScore?: number; tenantId: string }) {
    return this.prisma.qualityForm.create({ data });
  }

  async findAllForms(tenantId: string) {
    return this.prisma.qualityForm.findMany({
      where: { tenantId, isActive: true },
      include: { _count: { select: { evaluations: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOneForm(tenantId: string, id: string) {
      const form = await this.prisma.qualityForm.findFirst({ where: { id, tenantId }, include: { evaluations: { take: 10, orderBy: { createdAt: 'desc' } } } });
      if (!form) throw new NotFoundException(`Form ${id} not found`);
      return form;
  }

  async updateForm(tenantId: string, id: string, data: any) {
      return this.prisma.qualityForm.update({ where: { id, tenantId }, data });
  }

  async deleteForm(tenantId: string, id: string) {
      return this.prisma.qualityForm.update({ where: { id, tenantId }, data: { isActive: false } });
  }

  // Evaluations
  async createEvaluation(tenantId: string, data: {
    formId: string; callId?: string; agentId: string; evaluatorId: string;
    scores: any; totalScore: number; maxScore: number; comments?: string; tenantId: string;
  }) {
    const percentage = data.maxScore > 0 ? Math.round((data.totalScore / data.maxScore) * 100) : 0;
    return this.prisma.qualityEvaluation.create({
      data: { ...data, percentage },
      include: { form: { select: { name: true } } },
    });
  }

  async findEvaluations(tenantId: string, agentId?: string, page = 1, limit = 20) {
    const where: any = { tenantId };
    if (agentId) where.agentId = agentId;

    const [records, total] = await Promise.all([
      this.prisma.qualityEvaluation.findMany({
        where, skip: (page - 1) * limit, take: limit,
        include: { form: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.qualityEvaluation.count({ where }),
    ]);
    return { records, total, page, limit };
  }

  async getAgentQualityStats(tenantId: string, agentId: string) {
    const evals = await this.prisma.qualityEvaluation.findMany({ where: { agentId } });
    if (evals.length === 0) return { totalEvaluations: 0, avgPercentage: 0 };

    const avgPercentage = Math.round(evals.reduce((s, e) => s + e.percentage, 0) / evals.length);
    return { totalEvaluations: evals.length, avgPercentage };
  }
}
