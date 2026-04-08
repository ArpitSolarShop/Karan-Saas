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

    // Record the point event in UserPoint history
    await this.prisma.userPoint.create({
      data: {
        userId,
        points,
        reason: event,
        metadata: { tenantId },
      },
    });

    // Update the User's aggregate stats (totalPoints, level, currentStreak)
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        totalPoints: { increment: points },
      },
    });

    // Check level up
    await this.checkLevelUp(userId, updatedUser.totalPoints);
    // Check badge eligibility
    await this.checkBadgeEligibility(userId, tenantId);

    return updatedUser;
  }

  private async checkLevelUp(userId: string, totalPoints: number) {
    // Basic level logic: Level = floor(sqrt(totalPoints / 100)) + 1
    const newLevel = Math.floor(Math.sqrt(totalPoints / 100)) + 1;

    await this.prisma.user.update({
      where: { id: userId },
      data: { level: newLevel },
    });
  }

  async checkBadgeEligibility(userId: string, tenantId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { totalPoints: true, level: true, currentStreak: true },
    });
    if (!user) return;

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

      if (criteria.type === 'POINTS' && user.totalPoints >= criteria.value) eligible = true;
      if (criteria.type === 'LEVEL' && user.level >= criteria.value) eligible = true;
      if (criteria.type === 'STREAK' && user.currentStreak >= criteria.value) eligible = true;

      if (eligible) {
        await this.prisma.userBadge.create({
          data: { userId, badgeId: badge.id },
        });
        this.logger.log(`User ${userId} earned badge: ${badge.name}`);
      }
    }
  }

  async getLeaderboard(tenantId: string, limit = 10) {
    return this.prisma.user.findMany({
      where: { tenantId, isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        totalPoints: true,
        level: true,
        currentStreak: true,
        badges: {
          include: { badge: true },
        },
      },
      orderBy: { totalPoints: 'desc' },
      take: limit,
    });
  }

  async getUserPoints(userId: string) {
    return this.prisma.userPoint.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
