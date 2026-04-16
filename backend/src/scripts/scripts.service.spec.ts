import { Test, TestingModule } from '@nestjs/testing';
import { ScriptsService } from './scripts.service';
import { PrismaService } from "../prisma/prisma.service";

describe('ScriptsService', () => {
  let service: ScriptsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScriptsService, { provide: PrismaService, useValue: {} }],
    }).compile();

    service = module.get<ScriptsService>(ScriptsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
