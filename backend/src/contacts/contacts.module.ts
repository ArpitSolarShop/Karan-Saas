import { Module } from '@nestjs/common';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { LeadConvertService } from './services/lead-convert.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ContactsController],
  providers: [ContactsService, LeadConvertService],
  exports: [ContactsService, LeadConvertService],
})
export class ContactsModule {}
