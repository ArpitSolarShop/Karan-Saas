import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DialerPacingService {
  private readonly logger = new Logger(DialerPacingService.name);
  
  // In-memory cache for active dials to avoid constant DB hits for pacing
  private activeDials = new Map<string, number>(); // campaignId -> count
  private stats = new Map<string, { answered: number; dropped: number; total: number }>();

  constructor(private prisma: PrismaService) {}

  @OnEvent('freeswitch.call.answered')
  handleCallAnswered(payload: any) {
    // We don't have campaignId directly in ESL event usually, 
    // unless we pass it as a variable in originate.
    // For now, we'll assume we can resolve it or we just track global pacing.
    this.logger.debug(`Call answered: ${payload.uuid}`);
  }

  @OnEvent('freeswitch.call.hungup')
  handleCallHungup(payload: any) {
    this.logger.debug(`Call hungup: ${payload.uuid}`);
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

    // 2. Determine Pacing Multiplier
    // Basic: 1.5x for predictive, 1x for progressive/preview
    let multiplier = 1.0;
    if (campaign.dialerMode === 'PREDICTIVE') {
      multiplier = 2.0; // Start aggressive, adjust based on drop rate later
    } else if (campaign.dialerMode === 'PROGRESSIVE') {
      multiplier = 1.0;
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

    this.logger.log(`Campaign ${campaignId}: Agents=${availableAgents}, Multiplier=${multiplier}, ActiveDials=${activeDialsCount}, NewSlots=${slots}`);
    
    return slots;
  }

  /**
   * Adjusts the pacing multiplier based on the drop rate.
   * If drop rate > 3%, decrease multiplier.
   */
  private adjustPacing(campaignId: string) {
    // Implementation of pacing adaptation logic
  }
}
