import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private ai: AiService,
  ) {}

  // ── Agent Performance Report ──
  async agentPerformance(tenantId: string, agentId?: string, dateFrom?: string, dateTo?: string) {
    const where: any = { tenantId };
    if (agentId) where.agentId = agentId;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const agents = await this.prisma.user.findMany({
      where: {
        tenantId,
        role: { in: ['AGENT', 'TEAM_LEAD'] },
        ...(agentId ? { id: agentId } : {}),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        agentStatus: true,
      },
    });

    const results = [];
    for (const agent of agents) {
      const [
        totalCalls,
        completedCalls,
        totalTalkTime,
        assignedLeads,
        convertedLeads,
      ] = await Promise.all([
        this.prisma.call.count({ where: { tenantId, agentId: agent.id, ...where } }),
        this.prisma.call.count({
          where: { tenantId, agentId: agent.id, status: 'COMPLETED', ...where },
        }),
        this.prisma.call.aggregate({
          where: { tenantId, agentId: agent.id, ...where },
          _sum: { talkTimeSeconds: true },
        }),
        this.prisma.lead.count({ where: { tenantId, assignedTo: agent.id } }),
        this.prisma.lead.count({
          where: { tenantId, assignedTo: agent.id, status: 'CONVERTED' },
        }),
      ]);

      results.push({
        agent: {
          id: agent.id,
          name: `${agent.firstName} ${agent.lastName}`,
          role: agent.role,
          status: agent.agentStatus,
        },
        metrics: {
          totalCalls,
          completedCalls,
          answerRate:
            totalCalls > 0
              ? ((completedCalls / totalCalls) * 100).toFixed(1) + '%'
              : '0%',
          totalTalkTime: totalTalkTime._sum.talkTimeSeconds || 0,
          avgTalkTime:
            totalCalls > 0
              ? Math.round(
                  (totalTalkTime._sum.talkTimeSeconds || 0) / totalCalls,
                )
              : 0,
          assignedLeads,
          convertedLeads,
          conversionRate:
            assignedLeads > 0
              ? ((convertedLeads / assignedLeads) * 100).toFixed(1) + '%'
              : '0%',
        },
      });
    }
    return results;
  }

  // ── Campaign Report ──
  async campaignReport(tenantId: string, campaignId?: string) {
    const campaigns = await this.prisma.campaign.findMany({
      where: { tenantId, ...(campaignId ? { id: campaignId } : {}) },
      include: {
        _count: { select: { leads: true, calls: true, campaignAgents: true } },
      },
    });

    const results = [];
    for (const campaign of campaigns) {
      const [answeredCalls, convertedLeads, totalTalkTime] = await Promise.all([
        this.prisma.call.count({
          where: { tenantId, campaignId: campaign.id, status: 'COMPLETED' },
        }),
        this.prisma.lead.count({
          where: { tenantId, campaignId: campaign.id, status: 'CONVERTED' },
        }),
        this.prisma.call.aggregate({
          where: { tenantId, campaignId: campaign.id },
          _sum: { talkTimeSeconds: true },
        }),
      ]);

      results.push({
        campaign: {
          id: campaign.id,
          name: campaign.name,
          status: campaign.status,
          type: campaign.type,
        },
        metrics: {
          totalLeads: campaign._count.leads,
          totalCalls: campaign._count.calls,
          answeredCalls,
          answerRate:
            campaign._count.calls > 0
              ? ((answeredCalls / campaign._count.calls) * 100).toFixed(1) + '%'
              : '0%',
          convertedLeads,
          conversionRate:
            campaign._count.leads > 0
              ? ((convertedLeads / campaign._count.leads) * 100).toFixed(1) +
                '%'
              : '0%',
          totalTalkTime: totalTalkTime._sum.talkTimeSeconds || 0,
          assignedAgents: campaign._count.campaignAgents,
        },
      });
    }
    return results;
  }

  // ── Lead Funnel ──
  async leadFunnel(tenantId: string) {
    const statuses = [
      'NEW',
      'CONTACTED',
      'FOLLOW_UP',
      'INTERESTED',
      'NEGOTIATION',
      'CONVERTED',
      'LOST',
      'DNC',
    ];
    const funnel: any = {};
    for (const status of statuses) {
      funnel[status] = await this.prisma.lead.count({
        where: { tenantId, status: status as any },
      });
    }
    return {
      funnel,
      total: Object.values(funnel).reduce((a: number, b: any) => a + b, 0),
    };
  }

  // ── Source Analysis ──
  async sourceAnalysis(tenantId: string) {
    const leads = await this.prisma.lead.groupBy({
      by: ['source'],
      where: { tenantId },
      _count: true,
      orderBy: { _count: { source: 'desc' } },
    });
    return leads.map((l) => ({
      source: l.source || 'Unknown',
      count: l._count,
    }));
  }

  // ── Daily Call Volume ──
  async dailyCallVolume(tenantId: string, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const calls = await this.prisma.call.findMany({
      where: { tenantId, createdAt: { gte: since } },
      select: { createdAt: true, status: true },
    });

    const dayMap: any = {};
    calls.forEach((c) => {
      const day = c.createdAt.toISOString().split('T')[0];
      if (!dayMap[day]) dayMap[day] = { total: 0, completed: 0 };
      dayMap[day].total++;
      if (c.status === 'COMPLETED') dayMap[day].completed++;
    });

    return Object.entries(dayMap)
      .map(([date, data]: any) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  // ── Disposition Report ──
  async dispositionReport(
    tenantId: string,
    campaignId?: string,
    dateFrom?: string,
    dateTo?: string,
  ) {
    const where: any = { tenantId, dispositionId: { not: null } };
    if (campaignId) where.campaignId = campaignId;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const calls = await this.prisma.call.findMany({
      where,
      include: {
        disposition: {
          select: { name: true, code: true, category: true, colorHex: true },
        },
      },
    });

    const map = new Map<
      string,
      {
        name: string;
        code: string;
        category: string;
        color: string;
        count: number;
      }
    >();
    for (const c of calls) {
      if (!c.disposition) continue;
      const key = c.dispositionId!;
      const existing = map.get(key);
      if (existing) {
        existing.count++;
      } else {
        map.set(key, {
          name: c.disposition.name,
          code: c.disposition.code,
          category: c.disposition.category,
          color: c.disposition.colorHex,
          count: 1,
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }

  // ── Hourly Breakdown ──
  async hourlyBreakdown(tenantId: string, dateFrom?: string, dateTo?: string) {
    const where: any = { tenantId };
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const calls = await this.prisma.call.findMany({
      where,
      select: { createdAt: true, status: true },
    });
    const hours: Record<number, { total: number; completed: number }> = {};
    for (let h = 0; h < 24; h++) hours[h] = { total: 0, completed: 0 };

    calls.forEach((c) => {
      const h = new Date(c.createdAt).getHours();
      hours[h].total++;
      if (c.status === 'COMPLETED') hours[h].completed++;
    });

    return Object.entries(hours).map(([hour, data]) => ({
      hour: parseInt(hour),
      ...data,
    }));
  }

  // ── Missed / Failed Calls ──
  async missedCallsReport(
    tenantId: string,
    agentId?: string,
    dateFrom?: string,
    dateTo?: string,
  ) {
    const where: any = { tenantId, status: { in: ['NO_ANSWER', 'FAILED', 'BUSY'] } };
    if (agentId) where.agentId = agentId;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const calls = await this.prisma.call.findMany({
      where,
      include: {
        lead: { select: { name: true, firstName: true, phone: true } },
        agent: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });

    return { total: calls.length, calls };
  }

  // ── CSV Export (calls) ──
  async exportCallsCsv(
    tenantId: string,
    dateFrom?: string,
    dateTo?: string,
    agentId?: string,
  ): Promise<string> {
    const where: any = { tenantId };
    if (agentId) where.agentId = agentId;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const calls = await this.prisma.call.findMany({
      where,
      include: {
        lead: { select: { name: true, firstName: true, phone: true } },
        agent: { select: { firstName: true } },
        disposition: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50_000,
    });

    const header =
      'callId,leadName,phone,agent,status,direction,duration,disposition,date';
    const lines = calls.map((c) =>
      [
        c.id,
        c.lead?.name || c.lead?.firstName || '',
        c.lead?.phone || '',
        c.agent?.firstName || '',
        c.status,
        c.callDirection,
        c.durationSeconds,
        c.disposition?.name || '',
        c.createdAt.toISOString(),
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(','),
    );

    return [header, ...lines].join('\n');
  }

  // ── AI Predictive Business Intelligence ──
  async generateAIStoreForecast(tenantId: string) {
    // 1. Fetch relevant KPIs for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
 
    const [totalCalls, completedCalls, convertedLeads, totalTalkTime] = await Promise.all([
      this.prisma.call.count({ where: { tenantId, createdAt: { gte: sevenDaysAgo } } }),
      this.prisma.call.count({ where: { tenantId, createdAt: { gte: sevenDaysAgo }, status: 'COMPLETED' } }),
      this.prisma.lead.count({ where: { tenantId, status: 'CONVERTED', updatedAt: { gte: sevenDaysAgo } } }),
      this.prisma.call.aggregate({
        where: { tenantId, createdAt: { gte: sevenDaysAgo } },
        _sum: { durationSeconds: true },
      }),
    ]);

    const context = {
      period: 'Last 7 Days',
      totalCalls,
      completedCalls,
      convertedLeads,
      avgDuration: totalCalls > 0 ? (totalTalkTime._sum.durationSeconds || 0) / totalCalls : 0,
      conversionRate: completedCalls > 0 ? (convertedLeads / completedCalls).toFixed(4) : 0,
    };

    // 2. Feed to Open-Weights Model (handled via AiService)
    try {
      const gemmaResponse = await this.ai.evaluateLeadAction({
        leadName: 'Global Sales Dashboard',
        source: 'Aggregate KPIs',
        initialNotes: `KPI Context: ${JSON.stringify(context)}. Task: Predict the likely trend for the next 48 hours and provide a 2-sentence strategy optimization advice.`,
      });

      return {
        ...context,
        outlook: gemmaResponse.suggestedPriority, // Map to HIGH/MEDIUM/LOW
        analysis: gemmaResponse.summary,
      };
    } catch (err) {
      return {
        ...context,
        outlook: 'MEDIUM',
        analysis: 'AI Forecasting currently unavailable. Historical trends remain stable.',
      };
    }
  }
}
