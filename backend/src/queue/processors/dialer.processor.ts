import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { QUEUES } from '../queue.constants';
import { DialerService } from '../../dialer/dialer.service';

@Processor('campaign-dialer')
export class DialerProcessor {
  private readonly logger = new Logger(DialerProcessor.name);

  constructor(
    private prisma: PrismaService,
    private dialerService: DialerService
  ) {}

  /**
   * campaignTick — runs on a repeating interval per campaign.
   * Finds the next available lead and initiates a call via Twilio
   * (TelephonyService injected when wired in Sprint 3).
   */
  @Process('campaignTick')
  async handleCampaignTick(job: any) {
    const { campaignId } = job.data;

    // Get campaign config
    const campaign = (await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { campaignAgents: { include: { agent: true } } },
    })) as any;

    if (!campaign || campaign.status !== 'ACTIVE') {
      this.logger.debug(
        `[Dialer] Campaign ${campaignId} not active — skipping tick`,
      );
      return;
    }

    try {
        const result = await this.dialerService.startCampaign(campaignId, campaign.tenantId);
        if (result.queued && result.queued > 0) {
           this.logger.log(`[Dialer] Campaign ${campaignId} tick queued ${result.queued} calls (Max slots: ${result.slots})`);
        }
    } catch (err) {
        this.logger.error(`[Dialer] Tick failed for campaign ${campaignId}: ${err}`);
    }
  }

  /** Single direct dial job */
  @Process('dial')
  async handleDial(job: any) {
    this.logger.log(`[Dialer] Direct dial: lead ${job.data.leadId}`);
  }
}
