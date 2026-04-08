import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { DialerEngineService } from './services/dialer-engine.service';
import { TransmissionService } from './services/transmission.service';
import { DncService } from './services/dnc.service';
import { CampaignContactsService } from './services/campaign-contacts.service';
import { AgentScriptsService } from './services/agent-scripts.service';
import { DialerEngineController } from './controllers/dialer-engine.controller';
import { TransmissionController } from './controllers/transmission.controller';
import { DncController } from './controllers/dnc.controller';
import { CampaignContactsController } from './controllers/campaign-contacts.controller';
import { AgentScriptsController } from './controllers/agent-scripts.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    DialerEngineController,
    TransmissionController,
    DncController,
    CampaignContactsController,
    AgentScriptsController,
  ],
  providers: [
    DialerEngineService,
    TransmissionService,
    DncService,
    CampaignContactsService,
    AgentScriptsService,
  ],
  exports: [DialerEngineService, TransmissionService, DncService],
})
export class CampaignEngineModule {}
