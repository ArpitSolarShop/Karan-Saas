import { Global, Module } from '@nestjs/common';
import { BaileysEngineService } from './baileys.service';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappGateway } from './whatsapp.gateway';

@Global()
@Module({
  providers: [BaileysEngineService, WhatsappGateway],
  controllers: [WhatsappController],
  exports: [BaileysEngineService, WhatsappGateway],
})
export class WhatsappModule {}
