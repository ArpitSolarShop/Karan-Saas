import { Module } from '@nestjs/common';
import { CustomObjectsController } from './custom-objects.controller';
import { CustomObjectsService } from './custom-objects.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CustomObjectsController],
  providers: [CustomObjectsService],
  exports: [CustomObjectsService],
})
export class CustomObjectsModule {}
