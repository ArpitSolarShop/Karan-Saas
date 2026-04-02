import { Module } from '@nestjs/common';
import { EmailSyncService } from './email-sync.service';

@Module({
  providers: [EmailSyncService]
})
export class EmailSyncModule {}
