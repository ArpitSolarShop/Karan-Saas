import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { QUEUES } from '../queue.constants';

@Processor('callback-reminder')
export class CallbackReminderProcessor {
  private readonly logger = new Logger(CallbackReminderProcessor.name);

  constructor(private prisma: PrismaService) {}

  @Process('remind')
  async handleReminder(job: any) {
    const { callbackId, leadId, agentId } = job.data;
    this.logger.log(`[Callback] Reminder firing for callback ${callbackId}`);

    const callback = await this.prisma.callback.findUnique({
      where: { id: callbackId },
      include: { lead: { select: { name: true, phone: true } } },
    });

    if (!callback || callback.status !== 'PENDING') {
      this.logger.log(`[Callback] ${callbackId} already handled or not found`);
      return;
    }

    // Create an in-app notification for the agent
    await this.prisma.notification.create({
      data: {
        tenantId: callback.lead?.name ? 'dev-tenant-001' : 'dev-tenant-001',
        recipientId: agentId,
        type: 'CALLBACK_DUE',
        title: 'Callback Due',
        body: `Callback due for ${callback.lead?.name} (${callback.lead?.phone})`,
        entityType: 'CALLBACK',
        entityId: callbackId,
      },
    });

    this.logger.log(`[Callback] Notification created for agent ${agentId}`);
  }
}
