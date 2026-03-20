import { Module } from '@nestjs/common';
import { SheetsController } from './sheets.controller';
import { SheetsService } from './sheets.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SheetsGateway } from './sheets.gateway';
import { FormulaEngineService } from './formula-engine/formula-engine.service';

@Module({
  imports: [PrismaModule],
  controllers: [SheetsController],
  providers: [SheetsService, SheetsGateway, FormulaEngineService],
  exports: [SheetsService],
})
export class SheetsModule {}
