import { Test, TestingModule } from '@nestjs/testing';
import { DialerController } from './dialer.controller';
import { PrismaService } from "../prisma/prisma.service";
import { DialerService } from "./dialer.service";

describe('DialerController', () => {
  let controller: DialerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DialerController],
        providers: [{ provide: PrismaService, useValue: {} }, { provide: DialerService, useValue: {} }]
    }).compile();

    controller = module.get<DialerController>(DialerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
