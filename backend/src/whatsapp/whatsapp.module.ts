import { Global, Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BaileysEngineService } from './baileys.service';
import { CloudApiService } from './cloud-api.service';
import { WhatsappController } from './whatsapp.controller';
import { CloudApiWebhookController } from './cloud-api-webhook.controller';
import { WhatsappGateway } from './whatsapp.gateway';
import { MetricsService, whatsappSentCounterProvider, whatsappErrorCounterProvider } from './metrics.service';
import { CommunicationsModule } from '../communications/communications.module';

@Global()
@Module({
  imports: [ConfigModule, forwardRef(() => CommunicationsModule)],
  providers: [
    BaileysEngineService,
    CloudApiService,
    WhatsappGateway,
    MetricsService,
    whatsappSentCounterProvider,
    whatsappErrorCounterProvider,
  ],
  controllers: [WhatsappController, CloudApiWebhookController],
  exports: [BaileysEngineService, CloudApiService, WhatsappGateway, MetricsService],
})
export class WhatsappModule {}
