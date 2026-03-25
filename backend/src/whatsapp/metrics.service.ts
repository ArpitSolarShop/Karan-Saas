import { Injectable } from '@nestjs/common';
import { Counter } from 'prom-client';
import { InjectMetric, makeCounterProvider } from '@willsoto/nestjs-prometheus';

@Injectable()
export class MetricsService {
  constructor(
    @InjectMetric('whatsapp_messages_sent_total')
    private readonly whatsappMessagesSent: Counter<string>,
    @InjectMetric('whatsapp_messages_error_total')
    private readonly whatsappMessagesError: Counter<string>,
  ) {}

  incrementSent(instanceId: string, type: string = 'text') {
    this.whatsappMessagesSent.inc({ instance_id: instanceId, type });
  }

  incrementError(instanceId: string, errorType: string) {
    this.whatsappMessagesError.inc({ instance_id: instanceId, error_type: errorType });
  }
}

export const whatsappSentCounterProvider = makeCounterProvider({
  name: 'whatsapp_messages_sent_total',
  help: 'Total number of WhatsApp messages sent successfully',
  labelNames: ['instance_id', 'type'],
});

export const whatsappErrorCounterProvider = makeCounterProvider({
  name: 'whatsapp_messages_error_total',
  help: 'Total number of WhatsApp message failures',
  labelNames: ['instance_id', 'error_type'],
});
