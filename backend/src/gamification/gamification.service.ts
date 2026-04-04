import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export enum GamificationEvent {
  LEAD_CREATED = 'LEAD_CREATED',
  CALL_COMPLETED = 'CALL_COMPLETED',
  DEAL_WON = 'DEAL_WON',
  INVOICE_PAID = 'INVOICE_PAID',
  DAILY_LOGIN = 'DAILY_LOGIN',
}

const EVENT_POINTS: Record<GamificationEvent, number> = {
  [GamificationEvent.LEAD_CREATED]: 10,
  [GamificationEvent.CALL_COMPLETED]: 5,
  [GamificationEvent.DEAL_WON]: 100,
  [GamificationEvent.INVOICE_PAID]: 50,
  [GamificationEvent.DAILY_LOGIN]: 1,
};

@Injectable()
export class GamificationService {
  private readonly logger = new Logger(GamificationService.name);

  constructor(private prisma: PrismaService) {}

  async handleEvent(userId: string, event: GamificationEvent, tenantId: string) {
    const points = EVENT_POINTS[event];
    this.logger.log(`Awarding ${points} points to user ${userId} for event ${event}`);

    // Update UserStats
    const stats = await this.prisma.userStats.upsert({
      where: { userId },
      update: {
        points: { increment: points },
        experience: { increment: points },
        leadsCount: event === GamificationEvent.LEAD_CREATED ? { increment: 1 } : undefined,
        callsCount: event === GamificationEvent.CALL_COMPLETED ? { increment: 1 } : undefined,
        dealsCount: event === GamificationEvent.DEAL_WON ? { increment: 1 } : undefined,
      },
      create: {
        userId,
        points,
        experience: points,
        leadsCount: event === GamificationEvent.LEAD_CREATED ? 1 : 0,
        callsCount: event === GamificationEvent.CALL_COMPLETED ? 1 : 0,
        dealsCount: event === GamificationEvent.DEAL_WON ? 1 : 0,
      },
    });

    await this.checkLevelUp(userId, stats.experience);
    await this.checkBadgeEligibility(userId, tenantId);
    
    return stats;
  }

  private async checkLevelUp(userId: string, experience: number) {
    // Basic level logic: Level = floor(sqrt(exp / 100)) + 1
    const newLevel = Math.floor(Math.sqrt(experience / 100)) + 1;
    
    await this.prisma.userStats.update({
      where: { userId },
      data: { level: newLevel },
    });
  }

  async checkBadgeEligibility(userId: string, tenantId: string) {
    const userStats = await this.prisma.userStats.findUnique({ where: { userId } });
    if (!userStats) return;

    // Get all badges for this tenant (or global badges)
    const badges = await this.prisma.badge.findMany({
      where: {
        OR: [{ tenantId }, { tenantId: null }],
      },
    });

    for (const badge of badges) {
      const criteria = badge.criteria as any;
      let eligible = false;

      // check if user already has it
      const alreadyHas = await this.prisma.userBadge.findUnique({
        where: { userId_badgeId: { userId, badgeId: badge.id } },
      });
      if (alreadyHas) continue;

      if (criteria.type === 'LEAD_COUNT' && userStats.leadsCount >= criteria.value) eligible = true;
      if (criteria.type === 'CALL_COUNT' && userStats.callsCount >= criteria.value) eligible = true;
      if (criteria.type === 'POINTS' && userStats.points >= criteria.value) eligible = true;

      if (eligible) {
        await this.prisma.userBadge.create({
          data: { userId, badgeId: badge.id },
        });
        this.logger.log(`User ${userId} earned badge: ${badge.name}`);
      }
    }
  }
}
