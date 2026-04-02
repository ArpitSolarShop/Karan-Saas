import { Module } from '@nestjs/common';
import { GamificationService } from './gamification.service';

@Module({
  providers: [GamificationService]
})
export class GamificationModule {}
