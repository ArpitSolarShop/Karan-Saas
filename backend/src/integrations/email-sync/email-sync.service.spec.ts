import { Test, TestingModule } from '@nestjs/testing';
import { EmailSyncService } from './email-sync.service';

describe('EmailSyncService', () => {
  let service: EmailSyncService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailSyncService],
    }).compile();

    service = module.get<EmailSyncService>(EmailSyncService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
