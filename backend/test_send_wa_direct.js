const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/src/app.module');
const { CommunicationsService } = require('./dist/src/communications/communications.service');

async function bootstrap() {
  try {
    console.log('[Test] Bootstrapping NestJS application context...');
    const app = await NestFactory.createApplicationContext(AppModule);
    const commsService = app.get(CommunicationsService);

    const leadId = '1e34a742-761c-4f7e-bb22-d872bb010469'; // Karan Gond
    const message = 'Hello Karan! This is a direct test message from the Alpha CRM backend. WhatsApp integration is now verified. Session is live.';

    console.log(`[Test] Attempting to send WhatsApp message to lead ${leadId}...`);
    
    const result = await commsService.sendCommunication(leadId, 'WHATSAPP', message, 'SYSTEM');
    console.log('[Test] Result:', JSON.stringify(result, null, 2));

    await app.close();
    process.exit(0);
  } catch (err) {
    console.error('[Test] Critical Error:', err);
    process.exit(1);
  }
}

bootstrap();
