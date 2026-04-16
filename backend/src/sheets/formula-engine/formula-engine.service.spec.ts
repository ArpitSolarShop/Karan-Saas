import { Test, TestingModule } from '@nestjs/testing';
import { FormulaEngineService } from './formula-engine.service';
import { PrismaService } from "../../prisma/prisma.service";

describe('FormulaEngineService', () => {
  let service: FormulaEngineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FormulaEngineService, { provide: PrismaService, useValue: {} }],
    }).compile();

    service = module.get<FormulaEngineService>(FormulaEngineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
