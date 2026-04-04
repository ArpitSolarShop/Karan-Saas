import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FreeswitchService } from '../telephony/freeswitch.service';
import { TelephonyGateway } from '../telephony/telephony.gateway';

@Processor('dialer')
export class DialerProcessor extends WorkerHost {
  private readonly logger = new Logger(DialerProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly freeswitch: FreeswitchService,
    private readonly gateway: TelephonyGateway,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(
      `Processing Dial Job ${job.id} for lead ${job.data.leadId}`,
    );

    switch (job.name) {
      case 'predictive_dial': {
        const { leadId, campaignId, tenantId } = job.data;

        // 1. Fetch Lead
        const lead = await this.prisma.lead.findUnique({
          where: { id: leadId },
        });
        if (!lead || lead.isDnc) return;

        // 2. Originate call to a general routing extensions (e.g. 9999 for ACD queue)
        // In a true predictive dialer, we dial the customer FIRST, and when they answer, route to an agent.
        try {
          // Mock bridging to a routing extension that holds the call or finds an agent
          const callUuid = await this.freeswitch.originateCall(
            '9999',
            lead.phone,
          );

          await this.prisma.call.create({
            data: {
              tenantId,
              leadId,
              campaignId,
              agentId: '', // Routing queue puts this later if no agent right away, handled differently but needed for Prisma relation
              phoneDialed: lead.phone,
              telephonyCallSid: callUuid,
              callDirection: 'OUTBOUND',
              status: 'INITIATED',
              durationSeconds: 0,
            } as any,
          });

          this.gateway.server.emit(`campaign:${campaignId}:dial_dispatched`, {
            leadId,
            callUuid,
          });
        } catch (err) {
          this.logger.error(`Dial failed for lead ${leadId}: ${err}`);
        }
        break;
      }

      case 'progressive_dial': {
        let { leadId, agentId, campaignId, tenantId } = job.data;

        // If no agentId provided (queued without assignment), find one now
        if (!agentId) {
          const availableAgent = await this.prisma.user.findFirst({
            where: {
              tenantId,
              agentStatus: 'AVAILABLE',
              campaignAgents: { some: { campaignId } }
            }
          });
          if (!availableAgent) {
            // Re-queue or fail? For now, we'll log and return
            this.logger.warn(`No available agents for progressive dial job ${job.id}`);
            return;
          }
          agentId = availableAgent.id;
        }

        const lead = await this.prisma.lead.findUnique({
          where: { id: leadId },
        });
        const agent = await this.prisma.user.findUnique({
          where: { id: agentId },
        });

        if (!lead || !agent || !agent.extension) return;

        try {
          // Dial agent first, then bridge to customer
          const callUuid = await this.freeswitch.originateCall(
            agent.extension,
            lead.phone,
          );

          await this.prisma.call.create({
            data: {
              tenantId,
              leadId,
              agentId,
              campaignId,
              phoneDialed: lead.phone,
              telephonyCallSid: callUuid,
              callDirection: 'OUTBOUND',
              status: 'INITIATED',
              durationSeconds: 0,
            },
          });

          this.gateway.broadcastCallEvent(agentId, 'PROGRESSIVE_DIALING', {
            leadId,
            phone: lead.phone,
          });
        } catch (err) {
          this.logger.error(
            `Dial failed for agent ${agentId} to lead ${leadId}: ${err}`,
          );
        }
        break;
      }
    }

    return {};
  }
}
