import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WallboardService {
  constructor(private prisma: PrismaService) {}

  async getLiveData(tenantId: string) {
    const [totalAgents, availableAgents, onCallAgents, onBreakAgents, offlineAgents] = await Promise.all([
      this.prisma.user.count({ where: { tenantId, isActive: true, role: { in: ['AGENT', 'TEAM_LEAD', 'SUPERVISOR'] } } }),
      this.prisma.user.count({ where: { tenantId, agentStatus: 'AVAILABLE' } }),
      this.prisma.user.count({ where: { tenantId, agentStatus: 'ON_CALL' } }),
      this.prisma.user.count({ where: { tenantId, agentStatus: 'BREAK' } }),
      this.prisma.user.count({ where: { tenantId, agentStatus: 'OFFLINE' } }),
    ]);

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const [callsToday, answeredToday] = await Promise.all([
      this.prisma.call.count({ where: { tenantId, createdAt: { gte: today } } }),
      this.prisma.call.count({ where: { tenantId, createdAt: { gte: today }, status: 'COMPLETED' } }),
    ]);

    const activeSessions = await this.prisma.agentSession.findMany({
      where: { tenantId, status: 'ACTIVE' },
      include: {
        agent: { select: { firstName: true, lastName: true, agentStatus: true, extension: true } },
        pauses: { where: { endedAt: null }, include: { pauseCode: true } },
      },
    });

    const activeCampaigns = await this.prisma.campaign.findMany({
      where: { tenantId, status: 'ACTIVE' },
      select: { id: true, name: true, status: true },
    });

    return {
      agents: { total: totalAgents, available: availableAgents, onCall: onCallAgents, onBreak: onBreakAgents, offline: offlineAgents },
      calls: { today: callsToday, answered: answeredToday, answerRate: callsToday > 0 ? Math.round((answeredToday / callsToday) * 100) : 0 },
      activeSessions: activeSessions.map(s => ({
        id: s.id, agent: s.agent, loginAt: s.loginAt,
        callsHandled: s.callsHandled, totalTalkTime: s.totalTalkTime,
        currentPause: s.pauses.length > 0 ? s.pauses[0] : null,
      })),
      activeCampaigns,
    };
  }

  // Wallboard config CRUD
  async getConfigs(tenantId: string) {
    return this.prisma.wallboardConfig.findMany({ where: { tenantId }, orderBy: { name: 'asc' } });
  }

  async createConfig(data: { name: string; layout?: any; refreshRate?: number; tenantId: string; createdBy?: string }) {
    return this.prisma.wallboardConfig.create({ data });
  }

  async updateConfig(id: string, data: any) {
    return this.prisma.wallboardConfig.update({ where: { id }, data });
  }

  async deleteConfig(id: string) {
    return this.prisma.wallboardConfig.delete({ where: { id } });
  }
}
