import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { QUEUES } from '../queue.constants';

@Processor('campaign-dialer')
export class DialerProcessor {
  private readonly logger = new Logger(DialerProcessor.name);

  constructor(private prisma: PrismaService) {}

  /**
   * campaignTick — runs on a repeating interval per campaign.
   * Finds the next available lead and initiates a call via Twilio
   * (TelephonyService injected when wired in Sprint 3).
   */
  @Process('campaignTick')
  async handleCampaignTick(job: any) {
    const { campaignId } = job.data;

    // Get campaign config
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { campaignAgents: { include: { agent: true } } },
    }) as any;

    if (!campaign || campaign.status !== 'ACTIVE') {
      this.logger.log(`[Dialer] Campaign ${campaignId} not active — skipping tick`);
      return;
    }

    // Find next lead in the campaign list that hasn't been called yet today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextLead = await this.prisma.lead.findFirst({
      where: {
        campaignId,
        status: { in: ['NEW', 'FOLLOW_UP'] },
        calls: { none: { createdAt: { gte: today } } },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (!nextLead) {
      this.logger.log(`[Dialer] No more leads for campaign ${campaignId}`);
      return;
    }

    // Find an available agent from campaignAgents
    const availableAgent = campaign.campaignAgents?.find((ca: any) => ca.agent?.agentStatus === 'AVAILABLE')?.agent;
    if (!availableAgent) {
      this.logger.log(`[Dialer] No available agents for campaign ${campaignId}`);
      return;
    }

    this.logger.log(`[Dialer] Initiating call: lead ${nextLead.id} → agent ${availableAgent.id}`);

    // Mark lead as contacted
    await this.prisma.lead.update({
      where: { id: nextLead.id },
      data: { status: 'CONTACTED' },
    });

    // TODO Sprint 3: call TelephonyService.initiateCall(nextLead.phone, availableAgent.id, campaignId)
    // The TelephonyService will be injected once Sprint 3 is complete
  }

  /** Single direct dial job */
  @Process('dial')
  async handleDial(job: any) {
    this.logger.log(`[Dialer] Direct dial: lead ${job.data.leadId}`);
    // TODO Sprint 3: TelephonyService.initiateCall(...)
  }
}
