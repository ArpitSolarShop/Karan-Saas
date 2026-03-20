import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DialerController } from './dialer.controller';
import { DialerService } from './dialer.service';
import { DialerProcessor } from './dialer.processor';
import { PrismaModule } from '../prisma/prisma.module';
import { TelephonyModule } from '../telephony/telephony.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    PrismaModule,
    TelephonyModule,
    RedisModule,
    BullModule.registerQueue({
      name: 'dialer',
    }),
  ],
  controllers: [DialerController],
  providers: [DialerService, DialerProcessor],
  exports: [DialerService],
})
export class DialerModule {}
