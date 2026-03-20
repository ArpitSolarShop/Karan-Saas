import { Test, TestingModule } from '@nestjs/testing';
import { FormulaEngineService } from './formula-engine.service';

describe('FormulaEngineService', () => {
  let service: FormulaEngineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FormulaEngineService],
    }).compile();

    service = module.get<FormulaEngineService>(FormulaEngineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
