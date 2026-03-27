import { Injectable, Logger } from '@nestjs/common';
import { BaileysEngineService } from '../../whatsapp/baileys.service';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(private readonly baileysEngine: BaileysEngineService) {}

  async sendMessage(phone: string, message: string): Promise<{ success: boolean; messageId?: string }> {
    const activeSessions = this.baileysEngine.getActiveSessions();
    if (activeSessions.length === 0) {
      this.logger.error(
        'No active Baileys sessions. Connect a WhatsApp device in Settings first.',
      );
      return { success: false };
    }
    // Route via the primary (first connected) session
    this.logger.log(`Routing WhatsApp message to ${phone} via Baileys Engine`);
    return this.baileysEngine.sendMessage(phone, message, activeSessions[0]);
  }
}
