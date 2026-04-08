import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AgentSessionController } from './controllers/agent-session.controller';
import { AgentPauseController } from './controllers/agent-pause.controller';
import { AgentCapacityController } from './controllers/agent-capacity.controller';
import { AssignmentPolicyController } from './controllers/assignment-policy.controller';
import { WallboardController } from './controllers/wallboard.controller';
import { QualityController } from './controllers/quality.controller';
import { CsatController } from './controllers/csat.controller';
import { CannedResponseController } from './controllers/canned-response.controller';
import { AgentSessionService } from './services/agent-session.service';
import { AgentPauseService } from './services/agent-pause.service';
import { AgentCapacityService } from './services/agent-capacity.service';
import { AssignmentPolicyService } from './services/assignment-policy.service';
import { WallboardService } from './services/wallboard.service';
import { QualityService } from './services/quality.service';
import { CsatService } from './services/csat.service';
import { CannedResponseService } from './services/canned-response.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    AgentSessionController, AgentPauseController, AgentCapacityController,
    AssignmentPolicyController, WallboardController, QualityController,
    CsatController, CannedResponseController,
  ],
  providers: [
    AgentSessionService, AgentPauseService, AgentCapacityService,
    AssignmentPolicyService, WallboardService, QualityService,
    CsatService, CannedResponseService,
  ],
  exports: [AgentSessionService, AgentCapacityService, AssignmentPolicyService, WallboardService],
})
export class AgentManagementModule {}
