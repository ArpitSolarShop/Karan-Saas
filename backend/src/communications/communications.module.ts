import { Module, forwardRef } from '@nestjs/common';
import { CommunicationsService } from './communications.service';
import { CommunicationsController } from './communications.controller';
import { LeadsModule } from '../leads/leads.module';
import { ActivitiesModule } from '../activities/activities.module';
import { WhatsAppService } from './providers/whatsapp.service';
import { EmailService } from './providers/email.service';
import { WhatsAppClientService } from './whatsapp-client.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [LeadsModule, ActivitiesModule, PrismaModule],
  controllers: [CommunicationsController],
  providers: [CommunicationsService, WhatsAppService, EmailService, WhatsAppClientService],
  exports: [CommunicationsService, WhatsAppClientService],
})
export class CommunicationsModule {}
