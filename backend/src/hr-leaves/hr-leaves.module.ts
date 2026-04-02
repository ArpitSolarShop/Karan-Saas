import { Module } from '@nestjs/common';
import { HrLeavesController } from './hr-leaves.controller';
import { HrLeavesService } from './hr-leaves.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HrLeavesController],
  providers: [HrLeavesService],
  exports: [HrLeavesService],
})
export class HrLeavesModule {}
