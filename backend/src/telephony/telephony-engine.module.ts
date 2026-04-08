import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ExtensionsController } from './controllers/extensions.controller';
import { SipTrunksController } from './controllers/sip-trunks.controller';
import { IvrController } from './controllers/ivr.controller';
import { AcdQueuesController } from './controllers/acd-queues.controller';
import { SkillsController } from './controllers/skills.controller';
import { RingGroupsController } from './controllers/ring-groups.controller';
import { TimeConditionsController } from './controllers/time-conditions.controller';
import { CdrController } from './controllers/cdr.controller';
import { ExtensionsService } from './services/extensions.service';
import { SipTrunksService } from './services/sip-trunks.service';
import { IvrService } from './services/ivr.service';
import { AcdQueuesService } from './services/acd-queues.service';
import { SkillsService } from './services/skills.service';
import { RingGroupsService } from './services/ring-groups.service';
import { TimeConditionsService } from './services/time-conditions.service';
import { CdrService } from './services/cdr.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    ExtensionsController,
    SipTrunksController,
    IvrController,
    AcdQueuesController,
    SkillsController,
    RingGroupsController,
    TimeConditionsController,
    CdrController,
  ],
  providers: [
    ExtensionsService,
    SipTrunksService,
    IvrService,
    AcdQueuesService,
    SkillsService,
    RingGroupsService,
    TimeConditionsService,
    CdrService,
  ],
  exports: [
    ExtensionsService,
    AcdQueuesService,
    SkillsService,
    CdrService,
  ],
})
export class TelephonyEngineModule {}
