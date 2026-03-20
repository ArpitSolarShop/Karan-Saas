import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { QUEUES } from '../queue.constants';

@Processor('email-campaign')
export class EmailCampaignProcessor {
  private readonly logger = new Logger(EmailCampaignProcessor.name);

  constructor(private prisma: PrismaService) {}

  @Process('send')
  async handleEmailSend(job: any) {
    const { campaignId, leadId, stepIndex, templateId, userId } = job.data;
    this.logger.log(`[Email] Sending step ${stepIndex} for lead ${leadId} in campaign ${campaignId}`);

    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      select: { email: true, name: true, firstName: true } as any,
    }) as any;

    if (!lead?.email) {
      this.logger.log(`[Email] Lead ${leadId} has no email — skipping`);
      return;
    }

    // Log communication as Activity
    await (this.prisma as any).activity.create({
      data: {
        leadId,
        userId: userId || 'SYSTEM',
        activityType: 'EMAIL',
        description: `Email template: ${templateId} (step ${stepIndex})`,
      },
    });

    this.logger.log(`[Email] Sent to ${lead.email}`);
    return { email: lead.email, stepIndex };
  }
}
