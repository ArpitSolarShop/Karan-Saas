import { Injectable, Logger } from '@nestjs/common';
import { WhatsAppClientService } from '../whatsapp-client.service';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(private readonly waClient: WhatsAppClientService) {}

  async sendMessage(phone: string, message: string): Promise<boolean> {
    this.logger.log(
      `[REAL_SOCKET] Directing message to WhatsApp socket for ${phone}`,
    );
    return this.waClient.sendMessage(phone, message);
  }
}
