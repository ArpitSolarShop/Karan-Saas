import { Module } from '@nestjs/common';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AssetsController],
  providers: [AssetsService],
  exports: [AssetsService],
})
export class AssetsModule {}
