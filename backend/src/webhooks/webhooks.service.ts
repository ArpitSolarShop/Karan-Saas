import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  async handleIncomingWebhook(source: string, payload: any) {
    this.logger.log(`[Webhook] Received hook from ${source}. Payload size: ${JSON.stringify(payload).length} chars`);
    return { received: true };
  }
}
