import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { LeadsModule } from './leads/leads.module';
import { AuthModule } from './auth/auth.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { CallsModule } from './calls/calls.module';
import { SheetsModule } from './sheets/sheets.module';
import { ReportsModule } from './reports/reports.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DialerModule } from './dialer/dialer.module';
import { ActivitiesModule } from './activities/activities.module';
import { SearchModule } from './search/search.module';
import { AuditModule } from './audit/audit.module';
import { ScriptsService } from './scripts/scripts.service';
import { ScriptsController } from './scripts/scripts.controller';
import { TasksModule } from './tasks/tasks.module';
import { NotesModule } from './notes/notes.module';
import { RedisModule } from './redis/redis.module';
import { DealsModule } from './deals/deals.module';
import { QuotesModule } from './quotes/quotes.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { CommunicationsModule } from './communications/communications.module';
import { QueueModule } from './queue/queue.module';
import { TelephonyModule } from './telephony/telephony.module';
import { StorageModule } from './storage/storage.module';
import { AiModule } from './ai/ai.module';

import { WorkflowsModule } from './workflows/workflows.module';
import { TicketsModule } from './tickets/tickets.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { MarketingModule } from './marketing/marketing.module';
import { ApprovalsModule } from './approvals/approvals.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { BullModule as BullMQModule } from '@nestjs/bullmq';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    PrometheusModule.register(),
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    BullMQModule.forRoot({
      connection: (() => {
        const url = new URL(process.env.REDIS_URL || 'redis://127.0.0.1:6380');
        return {
          host: url.hostname,
          port: parseInt(url.port) || 6380,
        };
      })(),
    }),
    QueueModule, // Global — Bull (v3/4) queues
    StorageModule, // Global — MinIO file storage
    AuthModule,
    LeadsModule,
    CampaignsModule,
    CallsModule,
    SheetsModule,
    ReportsModule,
    NotificationsModule,
    DialerModule,
    ActivitiesModule,
    SearchModule,
    AuditModule,
    TasksModule,
    NotesModule,
    RedisModule,
    DealsModule,
    QuotesModule,
    AttachmentsModule,
    CommunicationsModule,
    TelephonyModule,
    AiModule,
    WorkflowsModule,
    TicketsModule,
    KnowledgeModule,
    MarketingModule,
    ApprovalsModule,
    WhatsappModule,
  ],
  controllers: [AppController, ScriptsController],
  providers: [AppService, PrismaService, ScriptsService],
})
export class AppModule {}
