import { Test, TestingModule } from '@nestjs/testing';
import { RazorpayService } from './razorpay.service';
import { PrismaService } from "../../prisma/prisma.service";

describe('RazorpayService', () => {
  let service: RazorpayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RazorpayService, { provide: PrismaService, useValue: {} }],
    }).compile();

    service = module.get<RazorpayService>(RazorpayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
