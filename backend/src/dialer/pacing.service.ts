import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DialerPacingService {
  private readonly logger = new Logger(DialerPacingService.name);
  
  // In-memory cache for active dials to avoid constant DB hits for pacing
  private activeDials = new Map<string, number>(); // campaignId -> count
  private stats = new Map<string, { answered: number; dropped: number; total: number }>();

  /** Per-campaign pacing multiplier (dynamically adjusted by drop-rate) */
  private multipliers = new Map<string, number>();

  constructor(private prisma: PrismaService) {}

  @OnEvent('freeswitch.call.answered')
  async handleCallAnswered(payload: any) {
    this.logger.debug(`Call answered: ${payload.uuid}`);
    // Resolve campaignId from the DB call record
    const call = await this.prisma.call.findFirst({
      where: { telephonyCallSid: payload.uuid },
      select: { campaignId: true },
    });
    if (call?.campaignId) {
      const s = this.stats.get(call.campaignId) || { answered: 0, dropped: 0, total: 0 };
      s.answered++;
      s.total++;
      this.stats.set(call.campaignId, s);
      // Decrement active dials
      const active = (this.activeDials.get(call.campaignId) || 1) - 1;
      this.activeDials.set(call.campaignId, Math.max(0, active));
    }
  }

  @OnEvent('freeswitch.call.hungup')
  async handleCallHungup(payload: any) {
    this.logger.debug(`Call hungup: ${payload.uuid}`);
    const call = await this.prisma.call.findFirst({
      where: { telephonyCallSid: payload.uuid },
      select: { campaignId: true, status: true },
    });
    if (call?.campaignId) {
      const s = this.stats.get(call.campaignId) || { answered: 0, dropped: 0, total: 0 };
      // A call that hung up before connecting to an agent is a "drop"
      if (call.status === 'INITIATED' || call.status === 'RINGING') {
        s.dropped++;
      }
      s.total++;
      this.stats.set(call.campaignId, s);
      // Decrement active dials
      const active = (this.activeDials.get(call.campaignId) || 1) - 1;
      this.activeDials.set(call.campaignId, Math.max(0, active));

      // Re-evaluate pacing after each hangup
      this.adjustPacing(call.campaignId);
    }
  }

  /**
   * Calculates how many new calls we can safely originate.
   * Logic: (Available Agents * Pacing Multiplier) - Current Active Dials
   */
  async getAvailablePacingSlots(campaignId: string, tenantId: string): Promise<number> {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { campaignAgents: { include: { agent: true } } }
    });

    if (!campaign || campaign.status !== 'ACTIVE') return 0;

    // 1. Count Available Agents
    const availableAgents = campaign.campaignAgents.filter(
      ca => ca.agent.agentStatus === 'AVAILABLE'
    ).length;

    if (availableAgents === 0) return 0;

    // 2. Determine Pacing Multiplier (use dynamic multiplier if available)
    let multiplier = this.multipliers.get(campaignId) ?? 1.0;
    if (campaign.dialerMode === 'PREDICTIVE') {
      multiplier = this.multipliers.get(campaignId) ?? 2.0;
    } else if (campaign.dialerMode === 'PROGRESSIVE') {
      multiplier = 1.0; // Progressive always 1:1
    } else {
      return 0; // Manual/Preview doesn't use auto-pacing
    }

    // 3. Count currently unfolding dials (Initiated but not reached disposition)
    const activeDialsCount = await this.prisma.call.count({
      where: {
        campaignId,
        status: { in: ['INITIATED', 'RINGING'] }
      }
    });

    const targetCalls = Math.floor(availableAgents * multiplier);
    const slots = Math.max(0, targetCalls - activeDialsCount);

    this.logger.log(`Campaign ${campaignId}: Agents=${availableAgents}, Multiplier=${multiplier.toFixed(2)}, ActiveDials=${activeDialsCount}, NewSlots=${slots}`);
    
    return slots;
  }

  /**
   * Adjusts the pacing multiplier based on the drop rate.
   *
   * TCPA/Ofcom compliance: drop rate must stay under 3%.
   * - Drop rate > 3%  → decrease multiplier by 0.3 (min 1.0)
   * - Drop rate 1%-3% → hold steady
   * - Drop rate < 1%  → increase multiplier by 0.1 (max 3.0)
   */
  private adjustPacing(campaignId: string) {
    const s = this.stats.get(campaignId);
    if (!s || s.total < 10) return; // Need at least 10 calls for meaningful stats

    const dropRate = s.dropped / s.total;
    const currentMultiplier = this.multipliers.get(campaignId) ?? 2.0;
    let newMultiplier = currentMultiplier;

    if (dropRate > 0.03) {
      // Drop rate too high — throttle aggressively
      newMultiplier = Math.max(1.0, currentMultiplier - 0.3);
      this.logger.warn(
        `Campaign ${campaignId}: Drop rate ${(dropRate * 100).toFixed(1)}% > 3% — reducing multiplier ${currentMultiplier.toFixed(2)} → ${newMultiplier.toFixed(2)}`,
      );
    } else if (dropRate < 0.01) {
      // Drop rate very low — we can be more aggressive
      newMultiplier = Math.min(3.0, currentMultiplier + 0.1);
      this.logger.log(
        `Campaign ${campaignId}: Drop rate ${(dropRate * 100).toFixed(1)}% < 1% — increasing multiplier ${currentMultiplier.toFixed(2)} → ${newMultiplier.toFixed(2)}`,
      );
    }

    this.multipliers.set(campaignId, newMultiplier);
  }
}

