import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AgentPauseService {
  constructor(private prisma: PrismaService) {}

  // Pause Codes CRUD
  async createPauseCode(data: { code: string; name: string; type?: any; maxDuration?: number; isPaid?: boolean; color?: string; tenantId: string }) {
    return this.prisma.pauseCode.create({ data });
  }

  async findAllPauseCodes(tenantId: string) {
    return this.prisma.pauseCode.findMany({
      where: { tenantId, isActive: true },
      include: { _count: { select: { pauses: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async updatePauseCode(id: string, data: any) {
    return this.prisma.pauseCode.update({ where: { id }, data });
  }

  async deletePauseCode(id: string) {
    return this.prisma.pauseCode.update({ where: { id }, data: { isActive: false } });
  }

  // Agent pause operations
  async startPause(sessionId: string, pauseCodeId: string, tenantId: string, notes?: string) {
    // End any existing unfinished pause
    await this.prisma.agentPause.updateMany({
      where: { sessionId, endedAt: null },
      data: { endedAt: new Date() },
    });

    const pause = await this.prisma.agentPause.create({
      data: { sessionId, pauseCodeId, tenantId, notes },
      include: { pauseCode: true },
    });

    // Update agent status
    const session = await this.prisma.agentSession.findUnique({ where: { id: sessionId } });
    if (session) {
      await this.prisma.user.update({ where: { id: session.agentId }, data: { agentStatus: 'BREAK' } });
    }

    return pause;
  }

  async endPause(pauseId: string) {
    const pause = await this.prisma.agentPause.findUnique({ where: { id: pauseId }, include: { session: true } });
    if (!pause) return null;

    const duration = Math.floor((Date.now() - pause.startedAt.getTime()) / 1000);
    const updated = await this.prisma.agentPause.update({
      where: { id: pauseId },
      data: { endedAt: new Date(), duration },
      include: { pauseCode: true },
    });

    // Restore agent status
    await this.prisma.user.update({ where: { id: pause.session.agentId }, data: { agentStatus: 'AVAILABLE' } });

    return updated;
  }

  async getActivePause(sessionId: string) {
    return this.prisma.agentPause.findFirst({
      where: { sessionId, endedAt: null },
      include: { pauseCode: true },
    });
  }

  async getPauseHistory(sessionId: string) {
    return this.prisma.agentPause.findMany({
      where: { sessionId },
      include: { pauseCode: true },
      orderBy: { startedAt: 'desc' },
    });
  }

  async getPauseStats(tenantId: string, from?: Date, to?: Date) {
    const where: any = { tenantId };
    if (from || to) { where.startedAt = {}; if (from) where.startedAt.gte = from; if (to) where.startedAt.lte = to; }

    const pauses = await this.prisma.agentPause.findMany({
      where, include: { pauseCode: true },
    });

    const byType: Record<string, { count: number; totalDuration: number }> = {};
    for (const p of pauses) {
      const type = p.pauseCode.name;
      if (!byType[type]) byType[type] = { count: 0, totalDuration: 0 };
      byType[type].count++;
      byType[type].totalDuration += p.duration || 0;
    }

    return {
      totalPauses: pauses.length,
      totalDuration: pauses.reduce((s, p) => s + (p.duration || 0), 0),
      byType,
    };
  }
}
