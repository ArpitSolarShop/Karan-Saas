import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { LeadsGateway } from './leads.gateway';
import { PrismaModule } from '../prisma/prisma.module';
import { ActivitiesModule } from '../activities/activities.module';
import { SearchModule } from '../search/search.module';
import { AuditModule } from '../audit/audit.module';
import { DedupeService } from './services/dedupe.service';

@Module({
  imports: [PrismaModule, ActivitiesModule, SearchModule],
  controllers: [LeadsController],
  providers: [LeadsService, LeadsGateway, DedupeService],
  exports: [LeadsService, LeadsGateway, DedupeService],
})
export class LeadsModule {}
