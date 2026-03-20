import { Module } from '@nestjs/common';
import { TelephonyController } from './telephony.controller';
import { TelephonyService } from './telephony.service';
import { PrismaModule } from '../prisma/prisma.module';
import { LeadsModule } from '../leads/leads.module';
import { AuthModule } from '../auth/auth.module';
import { StorageModule } from '../storage/storage.module';
import { AiModule } from '../ai/ai.module';
import { FreeswitchService } from './freeswitch.service';
import { TelephonyGateway } from './telephony.gateway';

@Module({
  imports: [PrismaModule, LeadsModule, AuthModule, StorageModule, AiModule],
  controllers: [TelephonyController],
  providers: [TelephonyService, FreeswitchService, TelephonyGateway],
  exports: [TelephonyService, FreeswitchService, TelephonyGateway],
})
export class TelephonyModule {}
