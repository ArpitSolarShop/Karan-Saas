import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CampaignsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.campaign.findMany({
      include: {
        _count: { select: { leads: true, calls: true, campaignAgents: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.campaign.findUnique({
      where: { id },
      include: {
        leads: { take: 50, orderBy: { createdAt: 'desc' } },
        campaignAgents: {
          include: {
            agent: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        calls: { take: 20, orderBy: { createdAt: 'desc' } },
        script: true,
        _count: { select: { leads: true, calls: true } },
      },
    });
  }

  async create(data: any) {
    return this.prisma.campaign.create({
      data: {
        tenantId: data.tenantId || 'dev-tenant-001',
        name: data.name,
        description: data.description,
        type: data.type || 'OUTBOUND',
        dialerMode: data.dialerMode || 'PREVIEW',
        status: data.status || 'DRAFT',
        startDate: new Date(data.startDate || Date.now()),
        endDate: data.endDate ? new Date(data.endDate) : null,
        callingStartTime: data.callingStartTime || '09:00',
        callingEndTime: data.callingEndTime || '20:00',
        timezone: data.timezone || 'Asia/Kolkata',
        maxAttemptsPerLead: data.maxAttemptsPerLead || 5,
        retryIntervalHours: data.retryIntervalHours || 4,
        createdById: data.createdById,
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.campaign.update({ where: { id }, data });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.campaign.update({
      where: { id },
      data: { status: status as any },
    });
  }

  async assignAgent(campaignId: string, agentId: string, dailyTarget?: number) {
    return this.prisma.campaignAgent.create({
      data: { campaignId, agentId, dailyTarget },
    });
  }

  async removeAgent(campaignId: string, agentId: string) {
    return this.prisma.campaignAgent.delete({
      where: { campaignId_agentId: { campaignId, agentId } },
    });
  }

  async getStats(id: string) {
    const [totalLeads, totalCalls, answeredCalls, convertedLeads] =
      await Promise.all([
        this.prisma.lead.count({ where: { campaignId: id } }),
        this.prisma.call.count({ where: { campaignId: id } }),
        this.prisma.call.count({
          where: { campaignId: id, status: 'COMPLETED' },
        }),
        this.prisma.lead.count({
          where: { campaignId: id, status: 'CONVERTED' },
        }),
      ]);
    return {
      totalLeads,
      totalCalls,
      answeredCalls,
      convertedLeads,
      conversionRate:
        totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0',
    };
  }

  async remove(id: string) {
    return this.prisma.campaign.delete({ where: { id } });
  }

  /** Clone a campaign — copies config as a new DRAFT */
  async clone(id: string) {
    const original = await this.prisma.campaign.findUniqueOrThrow({
      where: { id },
    });
    return this.prisma.campaign.create({
      data: {
        tenantId: original.tenantId,
        name: `${original.name} (Copy)`,
        description: original.description,
        type: original.type,
        dialerMode: original.dialerMode,
        status: 'DRAFT',
        startDate: new Date(),
        endDate: original.endDate,
        callingStartTime: original.callingStartTime,
        callingEndTime: original.callingEndTime,
        timezone: original.timezone,
        maxAttemptsPerLead: original.maxAttemptsPerLead,
        retryIntervalHours: original.retryIntervalHours,
        createdById: original.createdById,
      } as any,
    });
  }

  /** Import history — show all LeadLists uploaded for this campaign */
  async importHistory(campaignId?: string) {
    return this.prisma.leadList.findMany({
      where: campaignId ? { campaignLeadLists: { some: { campaignId } } } : {},
      include: { campaignLeadLists: { include: { campaign: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }) as any;
  }
}
