import { Injectable, Logger } from '@nestjs/common';
import { BaileysEngineService } from '../../whatsapp/baileys.service';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(private readonly baileysEngine: BaileysEngineService) {}

  async sendMessage(phone: string, message: string, tenantId: string): Promise<{ success: boolean; messageId?: string }> {
    this.logger.log(`Routing WhatsApp message to ${phone} via Baileys Engine for tenant ${tenantId}`);
    return this.baileysEngine.sendMessage(phone, message, undefined, tenantId);
  }
}
