import { Test, TestingModule } from '@nestjs/testing';
import { CustomObjectsService } from './custom-objects.service';

describe('CustomObjectsService', () => {
  let service: CustomObjectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomObjectsService],
    }).compile();

    service = module.get<CustomObjectsService>(CustomObjectsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
