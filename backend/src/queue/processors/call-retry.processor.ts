import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { QueueService } from '../queue.service';
import { QUEUES } from '../queue.constants';

@Processor('call-retry')
export class CallRetryProcessor {
  private readonly logger = new Logger(CallRetryProcessor.name);

  constructor(
    private prisma: PrismaService,
    private queueService: QueueService,
  ) {}

  @Process('retry')
  async handleRetry(job: any) {
    const { leadId, campaignId, reason } = job.data;
    this.logger.log(
      `[Retry] Retrying call for lead ${leadId} (reason: ${reason})`,
    );

    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead || lead.status === 'DNC' || lead.status === 'CONVERTED') {
      this.logger.log(`[Retry] Lead ${leadId} not eligible for retry`);
      return;
    }

    // Check max retry attempts (configurable, default 3)
    const todayAttempts = await this.prisma.call.count({
      where: {
        leadId,
        campaignId,
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    });

    if (todayAttempts >= 3) {
      this.logger.log(`[Retry] Max daily attempts reached for lead ${leadId}`);
      await this.prisma.lead.update({
        where: { id: leadId },
        data: { status: 'FOLLOW_UP' },
      });
      return;
    }

    // Queue the call back into the dialer queue
    await this.queueService.addDialerJob({ leadId, campaignId, agentId: job.data.agentId });

    this.logger.log(
      `[Retry] Re-queued call for lead ${leadId} (attempt ${todayAttempts + 1})`,
    );
  }
}
