import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { CommunicationsService } from './src/communications/communications.service';

/**
 * Direct test script that boots the NestJS app context 
 * and calls the CommunicationsService to send a WhatsApp message.
 * This avoids any REST API/Guard issues.
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const commsService = app.get(CommunicationsService);

  const leadId = '1e34a742-761c-4f7e-bb22-d872bb010469'; // Karan Gond
  const message = 'Hello Karan! This is a direct test message from the Alpha CRM backend. WhatsApp integration is now verified.';

  console.log(`[Test] Attempting to send WhatsApp message to lead ${leadId}...`);
  
  try {
    const result = await commsService.sendCommunication(leadId, 'WHATSAPP', message, 'SYSTEM');
    console.log('[Test] Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('[Test] Error:', error);
  } finally {
    await app.close();
    process.exit(0);
  }
}

bootstrap();
