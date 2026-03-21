import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { QUEUES } from './queue.constants';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('import') private importQueue: any,
    @InjectQueue('campaign-dialer') private dialerQueue: any,
    @InjectQueue('callback-reminder') private callbackQueue: any,
    @InjectQueue('call-retry') private retryQueue: any,
    @InjectQueue('whatsapp-blast') private waQueue: any,
    @InjectQueue('email-campaign') private emailQueue: any,
  ) {}

  // ── Import ──
  async addImportJob(data: { sheetId: string; rows: any[]; tenantId: string }) {
    return this.importQueue.add('processImport', data, {
      attempts: 3,
      backoff: 2000,
    });
  }

  // ── Dialer ──
  async addDialerJob(data: {
    campaignId: string;
    leadId: string;
    agentId?: string;
  }) {
    return this.dialerQueue.add('dial', data, { attempts: 1 });
  }

  async scheduleCampaignDialer(campaignId: string, intervalMs = 3000) {
    return this.dialerQueue.add(
      'campaignTick',
      { campaignId },
      { repeat: { every: intervalMs }, jobId: `campaign-${campaignId}` },
    );
  }

  async stopCampaignDialer(campaignId: string) {
    return this.dialerQueue.removeRepeatable('campaignTick', {
      every: 3000,
      jobId: `campaign-${campaignId}`,
    } as any);
  }

  // ── Callback Reminder ──
  async scheduleCallback(
    data: { callbackId: string; leadId: string; agentId: string },
    scheduledAt: Date,
  ) {
    const delay = scheduledAt.getTime() - Date.now();
    return this.callbackQueue.add('remind', data, {
      delay: Math.max(delay, 0),
      attempts: 2,
    });
  }

  // ── Call Retry ──
  async scheduleRetry(
    data: { leadId: string; campaignId: string; reason: string },
    delayMs = 300_000,
  ) {
    return this.retryQueue.add('retry', data, { delay: delayMs, attempts: 3 });
  }

  // ── WhatsApp Blast ──
  async addWhatsAppBlast(data: {
    campaignId: string;
    leads: { id: string; phone: string }[];
    template: string;
  }) {
    return this.waQueue.add('blast', data, { attempts: 3, backoff: 5000 });
  }

  // ── Email Campaign ──
  async addEmailCampaign(data: {
    campaignId: string;
    leadId: string;
    stepIndex: number;
    templateId: string;
  }) {
    return this.emailQueue.add('send', data, { attempts: 3, backoff: 5000 });
  }

  // ── Queue Status ──
  async getQueueStats() {
    const [
      importCounts,
      dialerCounts,
      callbackCounts,
      retryCounts,
      waCounts,
      emailCounts,
    ] = await Promise.all([
      this.importQueue.getJobCounts(),
      this.dialerQueue.getJobCounts(),
      this.callbackQueue.getJobCounts(),
      this.retryQueue.getJobCounts(),
      this.waQueue.getJobCounts(),
      this.emailQueue.getJobCounts(),
    ]);
    return {
      import: importCounts,
      dialer: dialerCounts,
      callback: callbackCounts,
      retry: retryCounts,
      whatsapp: waCounts,
      email: emailCounts,
    };
  }
}
