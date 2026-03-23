import { Module, forwardRef } from '@nestjs/common';
import { CommunicationsService } from './communications.service';
import { CommunicationsController } from './communications.controller';
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
    WhatsAppService,
    EmailService,
    // WhatsAppClientService is no longer here — BaileysEngineService is @Global()
    // and is injected automatically via WhatsappModule
  ],
  exports: [CommunicationsService],
})
export class CommunicationsModule {}
