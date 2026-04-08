import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AgentSessionService {
  private readonly logger = new Logger(AgentSessionService.name);

  constructor(private prisma: PrismaService) {}

  async login(agentId: string, tenantId: string, ipAddress?: string, userAgent?: string) {
    // End any existing active sessions
    await this.prisma.agentSession.updateMany({
      where: { agentId, status: 'ACTIVE' },
      data: { status: 'ENDED', logoutAt: new Date() },
    });

    const session = await this.prisma.agentSession.create({
      data: { agentId, tenantId, ipAddress, userAgent },
      include: { agent: { select: { firstName: true, lastName: true, email: true, role: true } } },
    });

    // Update agent status
    await this.prisma.user.update({ where: { id: agentId }, data: { agentStatus: 'AVAILABLE' } });

    this.logger.log(`[Session] Agent ${agentId} logged in (session: ${session.id})`);
    return session;
  }

  async logout(sessionId: string) {
    const session = await this.prisma.agentSession.update({
      where: { id: sessionId },
      data: { status: 'ENDED', logoutAt: new Date() },
    });

    await this.prisma.user.update({ where: { id: session.agentId }, data: { agentStatus: 'OFFLINE' } });

    // Calculate session totals
    const pauses = await this.prisma.agentPause.findMany({ where: { sessionId } });
    const totalPauseTime = pauses.reduce((sum, p) => sum + (p.duration || 0), 0);
    const loginTime = session.loginAt.getTime();
    const logoutTime = Date.now();
    const totalSessionTime = Math.floor((logoutTime - loginTime) / 1000);

    await this.prisma.agentSession.update({
      where: { id: sessionId },
      data: { totalPauseTime, totalIdleTime: totalSessionTime - totalPauseTime - session.totalTalkTime },
    });

    this.logger.log(`[Session] Agent ${session.agentId} logged out`);
    return session;
  }

  async getActiveSession(agentId: string) {
    return this.prisma.agentSession.findFirst({
      where: { agentId, status: 'ACTIVE' },
      include: { pauses: { include: { pauseCode: true }, orderBy: { startedAt: 'desc' } } },
      orderBy: { loginAt: 'desc' },
    });
  }

  async getActiveSessions(tenantId: string) {
    return this.prisma.agentSession.findMany({
      where: { tenantId, status: 'ACTIVE' },
      include: {
        agent: { select: { firstName: true, lastName: true, email: true, agentStatus: true, extension: true } },
        pauses: { where: { endedAt: null }, include: { pauseCode: true } },
      },
      orderBy: { loginAt: 'desc' },
    });
  }

  async getSessionHistory(agentId: string, from?: Date, to?: Date, page = 1, limit = 20) {
    const where: any = { agentId };
    if (from || to) { where.loginAt = {}; if (from) where.loginAt.gte = from; if (to) where.loginAt.lte = to; }

    const [records, total] = await Promise.all([
      this.prisma.agentSession.findMany({
        where, skip: (page - 1) * limit, take: limit,
        include: { _count: { select: { pauses: true } } },
        orderBy: { loginAt: 'desc' },
      }),
      this.prisma.agentSession.count({ where }),
    ]);
    return { records, total, page, limit };
  }

  async updateSessionStats(sessionId: string, data: { callsHandled?: number; totalTalkTime?: number }) {
    return this.prisma.agentSession.update({
      where: { id: sessionId },
      data: {
        ...(data.callsHandled !== undefined ? { callsHandled: { increment: data.callsHandled } } : {}),
        ...(data.totalTalkTime !== undefined ? { totalTalkTime: { increment: data.totalTalkTime } } : {}),
      },
    });
  }
}
