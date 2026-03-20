import { Test, TestingModule } from '@nestjs/testing';
import { DialerService } from './dialer.service';

describe('DialerService', () => {
  let service: DialerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DialerService],
    }).compile();

    service = module.get<DialerService>(DialerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
