// @ts-nocheck
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LeadsGateway } from '../leads/leads.gateway';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class CallsService {
  constructor(
    private prisma: PrismaService,
    private leadsGateway: LeadsGateway,
    private eventEmitter: EventEmitter2,
    private auditLogs: AuditLogsService,
  ) {}

  async findAll(tenantId: string, filters?: {
    agentId?: string;
    leadId?: string;
    campaignId?: string;
  }) {
    return this.prisma.call.findMany({
      where: {
        tenantId,
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

  async create(data: any, userId?: string) {
    const call = await this.prisma.call.create({
      data: {
        tenantId: data.tenantId,
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

    await this.auditLogs.logChange({
      tenantId: data.tenantId,
      userId: userId || data.agentId,
      action: 'CALL_STARTED',
      entityType: 'Call',
      entityId: call.id,
      details: { newValues: call },
    });
    // Emit real-time event — frontend supervisor/reports pages will update immediately
    this.leadsGateway.notifyCallStarted(data.leadId, data.agentId);
    
    // Trigger Phase 5 BI Monitoring
    this.eventEmitter.emit('call.created', call);

    return call;
  }

  async setDisposition(
    callId: string,
    tenantId: string,
    data: { dispositionId: string; notes?: string },
    userId?: string,
  ) {
    const existing = await this.prisma.call.findUnique({ where: { id: callId, tenantId } });
    const call = await this.prisma.call.update({
      where: { id: callId, tenantId },
      data: {
        dispositionId: data.dispositionId,
        notes: data.notes,
        status: 'COMPLETED',
        endedAt: new Date(),
      },
    });

    await this.auditLogs.logChange({
      tenantId,
      userId: userId || call.agentId,
      action: 'DISPOSITION_SET',
      entityType: 'Call',
      entityId: call.id,
      details: { 
        oldValues: existing, 
        newValues: call 
      },
    });

    this.eventEmitter.emit('call.completed', call);
    return call;
  }

  async endCall(
    callId: string,
    tenantId: string,
    data: {
      durationSeconds: number;
      talkTimeSeconds?: number;
      recordingUrl?: string;
    },
    userId?: string,
  ) {
    const existing = await this.prisma.call.findUnique({ where: { id: callId, tenantId } });
    const call = await this.prisma.call.update({
      where: { id: callId, tenantId },
      data: {
        endedAt: new Date(),
        durationSeconds: data.durationSeconds,
        talkTimeSeconds: data.talkTimeSeconds || data.durationSeconds,
        recordingUrl: data.recordingUrl,
        status: 'COMPLETED',
      },
    });

    await this.auditLogs.logChange({
      tenantId,
      userId: userId || call.agentId,
      action: 'CALL_ENDED',
      entityType: 'Call',
      entityId: call.id,
      details: { 
        oldValues: existing, 
        newValues: call 
      },
    });

    this.leadsGateway.notifyCallEnded(
      call.leadId,
      call.agentId,
      data.durationSeconds,
    );
    this.eventEmitter.emit('call.completed', call);
    return call;
  }

  // ── Dispositions ──
  async findAllDispositions(tenantId: string) {
    return this.prisma.disposition.findMany({
      where: { tenantId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createDisposition(data: {
    tenantId: string;
    name: string;
    code: string;
    category?: string;
    isCallback?: boolean;
    colorHex?: string;
    sortOrder?: number;
  }) {
    return this.prisma.disposition.create({
      data: {
        tenantId: data.tenantId,
        name: data.name,
        code: data.code,
        category: (data.category as any) || 'NEUTRAL',
        isCallback: data.isCallback || false,
        colorHex: data.colorHex || '#888888',
        sortOrder: data.sortOrder || 0,
      },
    });
  }

  // ── Callbacks ──
  async findCallbacksDue(tenantId: string) {
    const thirtyMinutesFromNow = new Date(Date.now() + 30 * 60 * 1000);
    return this.prisma.callback.findMany({
      where: { tenantId, status: 'PENDING', scheduledAt: { lte: thirtyMinutesFromNow } },
      include: {
        lead: {
          select: { id: true, firstName: true, name: true, phone: true },
        },
        agent: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async createCallback(data: {
    tenantId: string;
    leadId: string;
    agentId: string;
    callId?: string;
    scheduledAt: string | Date;
    notes?: string;
  }) {
    return this.prisma.callback.create({
      data: {
        tenantId: data.tenantId,
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
