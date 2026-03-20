import { Module } from '@nestjs/common';
import { MarketingController } from './marketing.controller';
import { MarketingService } from './marketing.service';
import { PrismaModule } from '../prisma/prisma.module';
import { BullModule } from '@nestjs/bullmq';

import { MarketingProcessor } from './marketing.processor';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'marketing',
    }),
  ],
  controllers: [MarketingController],
  providers: [MarketingService, MarketingProcessor],
  exports: [MarketingService],
})
export class MarketingModule {}
