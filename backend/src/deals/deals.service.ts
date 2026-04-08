import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class DealsService {
  constructor(
    private prisma: PrismaService,
    private auditLogs: AuditLogsService,
  ) {}

  async create(data: any, userId?: string) {
    // Basic forecasting based on stage probability if probability not explicitly sent
    if (!data.probability) {
      data.probability = this.getProbabilityForStage(data.stage || 'PROSPECTING');
    }

    return this.prisma.$transaction(async (tx) => {
      const deal = await tx.deal.create({ data });

      // 200% Feature: Unified Audit Engine
      await this.auditLogs.logChange({
        tenantId: data.tenantId,
        userId: userId || data.ownerId,
        action: 'DEAL_CREATED',
        entityType: 'Deal',
        entityId: deal.id,
        details: { newValues: deal },
      });

      return deal;
    });
  }

  async findAll(tenantId?: string) {
    const deals = await this.prisma.deal.findMany({
      where: tenantId ? { tenantId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        owner: { select: { firstName: true, lastName: true } },
        lead: { select: { firstName: true, name: true, companyName: true } },
        company: { select: { name: true } }
      },
    });

    // Decorate with expected value
    return deals.map(deal => ({
      ...deal,
      expectedValue: (deal.value * (deal.probability / 100)).toFixed(2)
    }));
  }

  async findOne(id: string) {
    const deal = await this.prisma.deal.findUnique({
      where: { id },
      include: {
        owner: { select: { firstName: true, lastName: true } },
        lead: true,
        company: true,
        quotes: true,
      },
    });
    if (!deal) throw new NotFoundException('Deal not found');
    
    return {
      ...deal,
      expectedValue: (deal.value * (deal.probability / 100)).toFixed(2)
    };
  }

  async update(id: string, data: any, userId?: string) {
    const existingDeal = await this.prisma.deal.findUnique({ where: { id } });
    if (!existingDeal) throw new NotFoundException('Deal not found');

    // Auto-update probability if stage changed and no specific probability provided
    if (data.stage && data.stage !== existingDeal.stage && !data.probability) {
      data.probability = this.getProbabilityForStage(data.stage);
    }

    return this.prisma.$transaction(async (tx) => {
      const deal = await tx.deal.update({ where: { id }, data });

      // 200% Feature: Consolidated History tracking
      await this.auditLogs.logChange({
        tenantId: deal.tenantId,
        userId: userId || deal.ownerId,
        action: data.stage && data.stage !== existingDeal.stage ? 'STAGE_CHANGED' : 'DEAL_UPDATED',
        entityType: 'Deal',
        entityId: deal.id,
        details: {
          oldValues: existingDeal,
          newValues: deal,
          metadata: {
            timeInPreviousStageMs: Date.now() - existingDeal.updatedAt.getTime()
          }
        },
      });

      return deal;
    });
  }

  async remove(id: string) {
    return this.prisma.deal.delete({ where: { id } });
  }

  // Helper method based on common CRM pipelines (e.g. Django-CRM / SuiteCRM)
  private getProbabilityForStage(stage: string): number {
    const stageProbabilities: Record<string, number> = {
      'PROSPECTING': 10,
      'QUALIFICATION': 20,
      'NEEDS_ANALYSIS': 35,
      'VALUE_PROPOSITION': 50,
      'ID_DECISION_MAKERS': 60,
      'PERCEPTION_ANALYSIS': 75,
      'PROPOSAL_PRICE_QUOTE': 80,
      'NEGOTIATION_REVIEW': 90,
      'CLOSED_WON': 100,
      'CLOSED_LOST': 0,
    };
    return stageProbabilities[stage.toUpperCase()] || 10;
  }
}
