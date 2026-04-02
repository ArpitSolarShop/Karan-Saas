import { Test, TestingModule } from '@nestjs/testing';
import { HrLeavesService } from './hr-leaves.service';

describe('HrLeavesService', () => {
  let service: HrLeavesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HrLeavesService],
    }).compile();

    service = module.get<HrLeavesService>(HrLeavesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
