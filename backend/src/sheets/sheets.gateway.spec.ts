import { Test, TestingModule } from '@nestjs/testing';
import { SheetsGateway } from './sheets.gateway';
import { PrismaService } from "../prisma/prisma.service";

describe('SheetsGateway', () => {
  let gateway: SheetsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SheetsGateway, { provide: PrismaService, useValue: {} }],
    }).compile();

    gateway = module.get<SheetsGateway>(SheetsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
