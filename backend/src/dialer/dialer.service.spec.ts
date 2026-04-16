import { Test, TestingModule } from '@nestjs/testing';
import { DialerService } from './dialer.service';
import { PrismaService } from "../prisma/prisma.service";
import { RedisService } from "../redis/redis.service";
import { DialerPacingService } from "./pacing.service";
import { getQueueToken } from "@nestjs/bullmq";

describe('DialerService', () => {
  let service: DialerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DialerService, 
        { provide: PrismaService, useValue: {} },
        { provide: RedisService, useValue: {} },
        { provide: DialerPacingService, useValue: {} },
        { provide: getQueueToken('dialer'), useValue: {} }
      ],
    }).compile();

    service = module.get<DialerService>(DialerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
