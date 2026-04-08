import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DialerEngineService {
  private readonly logger = new Logger(DialerEngineService.name);

  constructor(private prisma: PrismaService) {}

  async getDialerConfig(campaignId: string) {
    return this.prisma.dialerConfig.findUnique({
      where: { campaignId },
      include: { queue: { select: { name: true, strategy: true } } },
    });
  }

  async upsertDialerConfig(campaignId: string, tenantId: string, data: any) {
    return this.prisma.dialerConfig.upsert({
      where: { campaignId },
      create: { ...data, campaignId, tenantId },
      update: data,
    });
  }

  async startDialer(campaignId: string) {
    const config = await this.prisma.dialerConfig.findUnique({ where: { campaignId } });
    if (!config) throw new Error('No dialer config found for campaign');

    await this.prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'ACTIVE' },
    });

    this.logger.log(`[Dialer] Started campaign ${campaignId} in ${config.mode} mode`);
    return { status: 'STARTED', mode: config.mode, campaignId };
  }

  async pauseDialer(campaignId: string) {
    await this.prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'PAUSED' },
    });
    this.logger.log(`[Dialer] Paused campaign ${campaignId}`);
    return { status: 'PAUSED', campaignId };
  }

  async stopDialer(campaignId: string) {
    await this.prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'COMPLETED' },
    });
    this.logger.log(`[Dialer] Stopped campaign ${campaignId}`);
    return { status: 'STOPPED', campaignId };
  }

  async getCampaignProgress(campaignId: string) {
    const [total, completed, failed, pending, dnc] = await Promise.all([
      this.prisma.campaignContact.count({ where: { list: { campaignId } } }),
      this.prisma.campaignContact.count({ where: { list: { campaignId }, status: 'COMPLETED' } }),
      this.prisma.campaignContact.count({ where: { list: { campaignId }, status: 'FAILED' } }),
      this.prisma.campaignContact.count({ where: { list: { campaignId }, status: 'PENDING' } }),
      this.prisma.campaignContact.count({ where: { list: { campaignId }, isDnc: true } }),
    ]);

    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId }, select: { name: true, status: true },
    });

    return {
      campaignId, campaignName: campaign?.name, status: campaign?.status,
      total, completed, failed, pending, dnc,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      contactedRate: total > 0 ? Math.round(((completed + failed) / total) * 100) : 0,
    };
  }

  // Predictive pacing calculation (VICIdial algorithm adapted)
  calculatePacing(activeAgents: number, avgCallDuration: number, dropRateLimit: number, callsPerAgent: number): number {
    if (activeAgents === 0) return 0;
    const targetCalls = Math.ceil(activeAgents * callsPerAgent);
    const maxDropRate = dropRateLimit / 100;
    const adjustedCalls = Math.ceil(targetCalls * (1 + maxDropRate));
    return Math.min(adjustedCalls, activeAgents * 3); // Cap at 3x agents
  }
}
