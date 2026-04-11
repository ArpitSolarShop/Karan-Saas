import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailSyncService {
  private readonly logger = new Logger(EmailSyncService.name);

  async syncInbox(tenantId: string, emailAccount: string) {
    this.logger.log(`[EmailSync] Syncing inbox for ${emailAccount} (Tenant: ${tenantId})`);
    return { success: true, synced: 0, account: emailAccount };
  }
}
