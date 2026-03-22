import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BaileysEngineService } from './baileys.service';
import { CloudApiService } from './cloud-api.service';
import { WhatsappController } from './whatsapp.controller';
import { CloudApiWebhookController } from './cloud-api-webhook.controller';
import { WhatsappGateway } from './whatsapp.gateway';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [BaileysEngineService, CloudApiService, WhatsappGateway],
  controllers: [WhatsappController, CloudApiWebhookController],
  exports: [BaileysEngineService, CloudApiService, WhatsappGateway],
})
export class WhatsappModule {}
