import { Module, forwardRef } from '@nestjs/common';
import { CommunicationsService } from './communications.service';
import { CommunicationsController } from './communications.controller';
import { InboxService } from './inbox.service';
import { ConversationService } from './conversation.service';
import { CommunicationsGateway } from './communications.gateway';
import { LeadsModule } from '../leads/leads.module';
import { ActivitiesModule } from '../activities/activities.module';
import { WhatsAppService } from './providers/whatsapp.service';
import { EmailService } from './providers/email.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [LeadsModule, ActivitiesModule, PrismaModule],
  controllers: [CommunicationsController],
  providers: [
    CommunicationsService,
    InboxService,
    ConversationService,
    CommunicationsGateway,
    WhatsAppService,
    EmailService,
  ],
  exports: [CommunicationsService, InboxService, ConversationService, CommunicationsGateway],
})
export class CommunicationsModule {}
