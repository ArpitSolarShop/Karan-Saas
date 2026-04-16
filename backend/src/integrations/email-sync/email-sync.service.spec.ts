import { Test, TestingModule } from '@nestjs/testing';
import { EmailSyncService } from './email-sync.service';
import { PrismaService } from "../../prisma/prisma.service";

describe('EmailSyncService', () => {
  let service: EmailSyncService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailSyncService, { provide: PrismaService, useValue: {} }],
    }).compile();

    service = module.get<EmailSyncService>(EmailSyncService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
