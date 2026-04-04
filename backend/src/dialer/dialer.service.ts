import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { DialerPacingService } from './pacing.service';
import { CallType, CallStatus } from '@prisma/client';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class DialerService {
  private readonly logger = new Logger(DialerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly pacing: DialerPacingService,
    @InjectQueue('dialer') private readonly dialerQueue: Queue,
  ) {}

  /** Trigger Auto-Dialer campaign logic pushing leads to Redis/BullMQ based on pacing */
  async startCampaign(
    campaignId: string,
    tenantId: string,
  ) {
    // 1. Determine available slots from Pacing Service
    const slots = await this.pacing.getAvailablePacingSlots(campaignId, tenantId);
    
    if (slots <= 0) {
      this.logger.debug(`No available slots for campaign ${campaignId}. Skipping tick.`);
      return { status: 'WAITING_FOR_AGENTS', slots: 0 };
    }

    // 2. Fetch only 'slots' number of leads
    const leads = await this.prisma.lead.findMany({
      where: { 
        campaignId, 
        status: 'NEW', 
        isDnc: false 
      },
      take: slots,
      orderBy: { createdAt: 'asc' }
    });

    if (leads.length === 0) {
      return { status: 'NO_LEADS_LEFT', slots };
    }

    // 3. Queue the jobs
    const campaign = await this.prisma.campaign.findUnique({ where: { id: campaignId } });
    const dialJobName = campaign?.dialerMode === 'PREDICTIVE' ? 'predictive_dial' : 'progressive_dial';

    for (const lead of leads) {
      await this.dialerQueue.add(dialJobName, {
        leadId: lead.id,
        campaignId,
        tenantId,
      });
    }

    return { status: 'DIALING', queued: leads.length, slots };
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
      data: {
        status: isAmd ? 'NEW' : 'CONTACTED',
        lastContactedAt: new Date(),
      },
    });

    return { call, isAmd };
  }

  async endCall(callId: string, dispositionId: string, notes?: string) {
    const call = await this.prisma.call.findUnique({ where: { id: callId } });
    if (!call) throw new NotFoundException('Call not found');

    const endedAt = new Date();
    const duration = call.startedAt
      ? Math.floor((endedAt.getTime() - call.startedAt.getTime()) / 1000)
      : 0;

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
