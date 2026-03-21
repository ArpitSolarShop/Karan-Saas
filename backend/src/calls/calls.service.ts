import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LeadsGateway } from '../leads/leads.gateway';

@Injectable()
export class CallsService {
  constructor(
    private prisma: PrismaService,
    private leadsGateway: LeadsGateway,
  ) {}

  async findAll(filters?: {
    agentId?: string;
    leadId?: string;
    campaignId?: string;
  }) {
    return this.prisma.call.findMany({
      where: {
        ...(filters?.agentId && { agentId: filters.agentId }),
        ...(filters?.leadId && { leadId: filters.leadId }),
        ...(filters?.campaignId && { campaignId: filters.campaignId }),
      },
      include: {
        disposition: true,
        lead: {
          select: { id: true, firstName: true, name: true, phone: true },
        },
        agent: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async findOne(id: string) {
    return this.prisma.call.findUnique({
      where: { id },
      include: { disposition: true, lead: true, agent: true, callbacks: true },
    });
  }

  async create(data: any) {
    const call = await this.prisma.call.create({
      data: {
        tenantId: data.tenantId || 'dev-tenant-001',
        leadId: data.leadId,
        agentId: data.agentId,
        campaignId: data.campaignId,
        callDirection: data.callDirection || 'OUTBOUND',
        callType: data.callType || 'MANUAL',
        phoneDialed: data.phoneDialed,
        status: data.status || 'INITIATED',
        startedAt: new Date(),
      },
    });
    // Emit real-time event — frontend supervisor/reports pages will update immediately
    this.leadsGateway.notifyCallStarted(data.leadId, data.agentId);
    return call;
  }

  async setDisposition(
    callId: string,
    data: { dispositionId: string; notes?: string },
  ) {
    return this.prisma.call.update({
      where: { id: callId },
      data: {
        dispositionId: data.dispositionId,
        notes: data.notes,
        status: 'COMPLETED',
        endedAt: new Date(),
      },
    });
  }

  async endCall(
    callId: string,
    data: {
      durationSeconds: number;
      talkTimeSeconds?: number;
      recordingUrl?: string;
    },
  ) {
    const call = await this.prisma.call.update({
      where: { id: callId },
      data: {
        endedAt: new Date(),
        durationSeconds: data.durationSeconds,
        talkTimeSeconds: data.talkTimeSeconds || data.durationSeconds,
        recordingUrl: data.recordingUrl,
        status: 'COMPLETED',
      },
    });
    // Emit real-time event — supervisor page and reports page will invalidate their caches
    this.leadsGateway.notifyCallEnded(
      call.leadId,
      call.agentId,
      data.durationSeconds,
    );
    return call;
  }

  // ── Dispositions ──
  async findAllDispositions(tenantId?: string) {
    return this.prisma.disposition.findMany({
      where: tenantId ? { tenantId } : undefined,
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createDisposition(data: any) {
    return this.prisma.disposition.create({
      data: {
        tenantId: data.tenantId || 'dev-tenant-001',
        name: data.name,
        code: data.code,
        category: data.category || 'NEUTRAL',
        isCallback: data.isCallback || false,
        colorHex: data.colorHex || '#888888',
        sortOrder: data.sortOrder || 0,
      },
    });
  }

  // ── Callbacks ──
  async findCallbacksDue() {
    const thirtyMinutesFromNow = new Date(Date.now() + 30 * 60 * 1000);
    return this.prisma.callback.findMany({
      where: { status: 'PENDING', scheduledAt: { lte: thirtyMinutesFromNow } },
      include: {
        lead: {
          select: { id: true, firstName: true, name: true, phone: true },
        },
        agent: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async createCallback(data: any) {
    return this.prisma.callback.create({
      data: {
        leadId: data.leadId,
        agentId: data.agentId,
        callId: data.callId,
        scheduledAt: new Date(data.scheduledAt),
        notes: data.notes,
      },
    });
  }

  // ── Agent Stats ──
  async getAgentStats(agentId: string, date?: string) {
    const statDate = date ? new Date(date) : new Date();
    statDate.setHours(0, 0, 0, 0);

    let stats = await this.prisma.agentDailyStat.findUnique({
      where: { agentId_statDate: { agentId, statDate } },
    });

    if (!stats) {
      // Compute from call_logs
      const dayStart = new Date(statDate);
      const dayEnd = new Date(statDate);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const [callsMade, callsAnswered, totalTalkTime] = await Promise.all([
        this.prisma.call.count({
          where: { agentId, createdAt: { gte: dayStart, lt: dayEnd } },
        }),
        this.prisma.call.count({
          where: {
            agentId,
            status: 'COMPLETED',
            createdAt: { gte: dayStart, lt: dayEnd },
          },
        }),
        this.prisma.call.aggregate({
          where: { agentId, createdAt: { gte: dayStart, lt: dayEnd } },
          _sum: { talkTimeSeconds: true },
        }),
      ]);

      stats = {
        id: 'computed',
        agentId,
        statDate,
        callsMade,
        callsAnswered,
        callsConverted: 0,
        totalTalkTime: totalTalkTime._sum.talkTimeSeconds || 0,
        avgHandleTime: 0,
        totalBreakTime: 0,
        loginTime: null,
        logoutTime: null,
        callbacksScheduled: 0,
        callbacksCompleted: 0,
      } as any;
    }

    return stats;
  }
}
