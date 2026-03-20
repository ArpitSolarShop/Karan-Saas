import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CallType, CallStatus } from '@prisma/client';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class DialerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    @InjectQueue('dialer') private readonly dialerQueue: Queue
  ) {}

  /** Trigger Auto-Dialer campaign logic pushing thousands of leads to Redis/BullMQ */
  async startCampaign(campaignId: string, type: 'predictive' | 'progressive' = 'predictive') {
    const leads = await this.prisma.lead.findMany({ 
      where: { campaignId, status: 'NEW', isDnc: false } 
    });
    
    // Fire-and-forget push to Redis-backed job queue
    for (const lead of leads) {
      if (type === 'predictive') {
        await this.dialerQueue.add('predictive_dial', { leadId: lead.id, campaignId, tenantId: lead.tenantId });
      } else {
        const agent = await this.prisma.user.findFirst({ where: { tenantId: lead.tenantId, agentStatus: 'AVAILABLE' } });
        if (agent) {
          await this.dialerQueue.add('progressive_dial', { leadId: lead.id, agentId: agent.id, campaignId, tenantId: lead.tenantId });
        }
      }
    }
    
    return { status: 'DIALING', queued: leads.length };
  }

  // ── Existing Manual Stubs ───────────────────────────────────────────────

  async getNextLead(campaignId: string, agentId: string) {
    const queueName = `campaign:${campaignId}:queue`;
    let leadData = await this.redis.popFromQueue(queueName);

    if (!leadData) {
      const leads = await this.prisma.lead.findMany({
        where: { campaignId, status: 'NEW', isDnc: false },
        orderBy: [{ score: 'desc' }, { priority: 'asc' }],
        take: 50,
      });

      for (const l of leads) {
        await this.redis.pushToQueue(queueName, l);
      }
      leadData = await this.redis.popFromQueue(queueName);
    }
    return leadData;
  }

  async startCall(leadId: string, agentId: string, mode: CallType = 'PREVIEW') {
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new NotFoundException('Lead not found');

    const isAmd = Math.random() < 0.2;
    const status = isAmd ? CallStatus.FAILED : CallStatus.IN_PROGRESS;

    const call = await this.prisma.call.create({
      data: {
        tenantId: lead.tenantId,
        leadId,
        agentId,
        campaignId: lead.campaignId,
        phoneDialed: lead.phone,
        callType: mode,
        status,
        startedAt: new Date(),
        isAmd,
        notes: isAmd ? 'AMD detected: Answering Machine' : 'Call connected',
      },
    });

    await this.prisma.lead.update({
      where: { id: leadId },
      data: { status: isAmd ? 'NEW' : 'CONTACTED', lastContactedAt: new Date() },
    });

    return { call, isAmd };
  }

  async endCall(callId: string, dispositionId: string, notes?: string) {
    const call = await this.prisma.call.findUnique({ where: { id: callId } });
    if (!call) throw new NotFoundException('Call not found');

    const endedAt = new Date();
    const duration = call.startedAt ? Math.floor((endedAt.getTime() - call.startedAt.getTime()) / 1000) : 0;

    return this.prisma.call.update({
      where: { id: callId },
      data: {
        status: CallStatus.COMPLETED,
        dispositionId,
        notes,
        endedAt,
        durationSeconds: duration,
        talkTimeSeconds: duration,
      },
    });
  }
}
