import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { QUEUES } from './queue.constants';
import { ImportProcessor } from './processors/import.processor';
import { DialerProcessor } from './processors/dialer.processor';
import { CallbackReminderProcessor } from './processors/callback-reminder.processor';
import { CallRetryProcessor } from './processors/call-retry.processor';
import { WhatsAppBlastProcessor } from './processors/whatsapp-blast.processor';
import { EmailCampaignProcessor } from './processors/email-campaign.processor';
import { QueueService } from './queue.service';
import { QueueController } from './queue.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

const REDIS_CONFIG = {
  host: (process.env.REDIS_URL || 'redis://localhost:6380').replace('redis://', '').split(':')[0],
  port: parseInt((process.env.REDIS_URL || 'redis://localhost:6380').split(':')[2] || '6380'),
};


@Global()
@Module({
  imports: [
    PrismaModule,
    AuthModule,
    BullModule.forRoot({ redis: REDIS_CONFIG }),
    BullModule.registerQueue(
      { name: QUEUES.IMPORT },
      { name: 'campaign-dialer' },
      { name: QUEUES.CALLBACK_REMINDER },
      { name: QUEUES.CALL_RETRY },
      { name: QUEUES.WHATSAPP_BLAST },
      { name: QUEUES.EMAIL_CAMPAIGN },
    ),
  ],
  controllers: [QueueController],
  providers: [
    QueueService,
    ImportProcessor,
    DialerProcessor,
    CallbackReminderProcessor,
    CallRetryProcessor,
    WhatsAppBlastProcessor,
    EmailCampaignProcessor,
  ],
  exports: [BullModule, QueueService],
})
export class QueueModule {}
