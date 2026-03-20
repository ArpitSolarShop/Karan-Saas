import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { QUEUES } from '../queue.constants';

@Processor('whatsapp-blast')
export class WhatsAppBlastProcessor {
  private readonly logger = new Logger(WhatsAppBlastProcessor.name);

  constructor(private prisma: PrismaService) {}

  @Process('blast')
  async handleBlast(job: any) {
    const { campaignId, leads, template, userId } = job.data;
    this.logger.log(`[WhatsApp] Blasting ${leads.length} leads for campaign ${campaignId}`);

    let sent = 0;
    let failed = 0;

    for (const lead of leads) {
      try {
        // Format message
        const message = template.replace('{{name}}', lead.phone);

        // Log communication as Activity
        await (this.prisma as any).activity.create({
          data: {
            leadId: lead.id,
            userId: userId || 'SYSTEM',
            activityType: 'WHATSAPP',
            description: message,
          },
        });

        sent++;
        await job.progress(Math.round((sent / leads.length) * 100));
      } catch (e) {
        this.logger.error(`[WhatsApp] Failed for lead ${lead.id}: ${(e as Error).message}`);
        failed++;
      }
    }

    return { sent, failed };
  }
}
