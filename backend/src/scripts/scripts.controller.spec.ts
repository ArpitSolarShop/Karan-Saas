import { Test, TestingModule } from '@nestjs/testing';
import { ScriptsController } from './scripts.controller';
import { PrismaService } from "../prisma/prisma.service";
import { ScriptsService } from "./scripts.service";

describe('ScriptsController', () => {
  let controller: ScriptsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScriptsController],
        providers: [{ provide: PrismaService, useValue: {} }, { provide: ScriptsService, useValue: {} }]
    }).compile();

    controller = module.get<ScriptsController>(ScriptsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
