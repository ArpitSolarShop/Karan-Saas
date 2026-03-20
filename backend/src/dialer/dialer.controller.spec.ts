import { Test, TestingModule } from '@nestjs/testing';
import { DialerController } from './dialer.controller';

describe('DialerController', () => {
  let controller: DialerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DialerController],
    }).compile();

    controller = module.get<DialerController>(DialerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
