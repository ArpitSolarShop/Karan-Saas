import { Test, TestingModule } from '@nestjs/testing';
import { SurveysService } from './surveys.service';
import { PrismaService } from "../prisma/prisma.service";

describe('SurveysService', () => {
  let service: SurveysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SurveysService, { provide: PrismaService, useValue: {} }],
    }).compile();

    service = module.get<SurveysService>(SurveysService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
