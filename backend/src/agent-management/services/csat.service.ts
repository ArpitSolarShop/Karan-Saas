import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CsatService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, data: { rating: number; feedbackMessage?: string; callId?: string; conversationId?: string; contactId?: string; agentId?: string; channel?: string; tenantId: string }) {
    return this.prisma.csatResponse.create({ data });
  }

  async findAll(tenantId: string, page = 1, limit = 50, agentId?: string) {
    const where: any = { tenantId };
    if (agentId) where.agentId = agentId;

    const [records, total] = await Promise.all([
      this.prisma.csatResponse.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.csatResponse.count({ where }),
    ]);
    return { records, total, page, limit };
  }

  async getStats(tenantId: string, from?: Date, to?: Date) {
    const where: any = { tenantId };
    if (from || to) { where.createdAt = {}; if (from) where.createdAt.gte = from; if (to) where.createdAt.lte = to; }

    const responses = await this.prisma.csatResponse.findMany({ where, select: { rating: true } });
    if (responses.length === 0) return { totalResponses: 0, avgRating: 0, distribution: {}, csatScore: 0 };

    const avgRating = responses.reduce((s, r) => s + r.rating, 0) / responses.length;
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    responses.forEach(r => { distribution[r.rating] = (distribution[r.rating] || 0) + 1; });

    const satisfied = (distribution[4] || 0) + (distribution[5] || 0);
    const csatScore = Math.round((satisfied / responses.length) * 100);

    return { totalResponses: responses.length, avgRating: Math.round(avgRating * 10) / 10, distribution, csatScore };
  }

  async getAgentCsat(tenantId: string, agentId: string) {
    const responses = await this.prisma.csatResponse.findMany({ where: { agentId }, select: { rating: true } });
    if (responses.length === 0) return { totalResponses: 0, avgRating: 0, csatScore: 0 };

    const avgRating = responses.reduce((s, r) => s + r.rating, 0) / responses.length;
    const satisfied = responses.filter(r => r.rating >= 4).length;
    return { totalResponses: responses.length, avgRating: Math.round(avgRating * 10) / 10, csatScore: Math.round((satisfied / responses.length) * 100) };
  }
}
