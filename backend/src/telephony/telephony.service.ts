import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FreeswitchService } from './freeswitch.service';
import { TelephonyGateway } from './telephony.gateway';

@Injectable()
export class TelephonyService {
  private readonly logger = new Logger(TelephonyService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly freeswitch: FreeswitchService,
    private readonly gateway: TelephonyGateway,
  ) {}

  get isConnected() {
    return true; // Expand later if needed
  }

  // ── Call Management ─────────────────────────────────────────────────────

  async initiateCall(tenantId: string, {
    toNumber,
    leadId,
    agentId,
    campaignId,
  }: {
    toNumber: string;
    leadId: string;
    agentId: string;
    campaignId?: string;
  }) {
    const agent = await this.prisma.user.findFirst({ where: { id: agentId, tenantId } });
    if (!agent || !agent.extension)
      throw new Error('Agent extension not found or unauthorized');

    const callUUID = await this.freeswitch.originateCall(
      tenantId,
      agent.extension,
      toNumber,
    );

    await this.prisma.call.create({
      data: {
        tenantId: agent.tenantId,
        telephonyCallSid: callUUID,
        agentId,
        leadId,
        campaignId,
        phoneDialed: toNumber,
        callDirection: 'OUTBOUND',
        status: 'INITIATED',
        durationSeconds: 0,
      } as any,
    });

    return callUUID;
  }

  async transferCall(tenantId: string, callUUID: string, targetExtension: string) {
    this.logger.log(`[Tenant: ${tenantId}] Transferring ${callUUID} to ${targetExtension}`);
    await this.freeswitch.transfer(tenantId, callUUID, targetExtension);
    return { callUUID, targetExtension };
  }

  async hangupCall(tenantId: string, callUUID: string) {
    await this.freeswitch.hangup(tenantId, callUUID);
    await this.prisma.call.updateMany({
      where: { telephonyCallSid: callUUID, tenantId },
      data: { status: 'COMPLETED' as any },
    });
  }

  async muteCall(tenantId: string, callUUID: string, mute: boolean) {
    this.logger.log(`[Tenant: ${tenantId}] Muted ${callUUID}: ${mute}`);
  }

  // ── Supervisor Controls ─────────────────────────────────────────────────

  async whisperToAgent(tenantId: string, callUUID: string, supervisorExtension: string) {
    this.logger.log(`[Tenant: ${tenantId}] Whispering on ${callUUID} from ${supervisorExtension}`);
  }

  async bargeIn(tenantId: string, callUUID: string, supervisorExtension: string) {
    this.logger.log(`[Tenant: ${tenantId}] Barging in on ${callUUID} from ${supervisorExtension}`);
  }

  // ── Recording ───────────────────────────────────────────────────────────

  async startRecording(tenantId: string, callUUID: string) {
    this.logger.log(`[Tenant: ${tenantId}] Start recording ${callUUID}`);
    return `recordings/${callUUID}.wav`;
  }

  async stopRecording(tenantId: string, callUUID: string) {
    this.logger.log(`[Tenant: ${tenantId}] Stop recording ${callUUID}`);
  }

  // ── SIP.js Configuration ───────────────────────────────────────────────

  async getSipConfig(tenantId: string, agentId: string) {
    const agent = await this.prisma.user.findFirst({ where: { id: agentId, tenantId } });
    const domain = process.env.FREESWITCH_DOMAIN || '127.0.0.1';
    const wssPort = process.env.FREESWITCH_WSS_PORT || '7443';

    return {
      sipUri: `sip:${agent?.extension}@${domain}`,
      wsServer: `wss://${domain}:${wssPort}`,
      password: agent?.sipPassword || '1234',
      iceServers: [
        { urls: [process.env.STUN_SERVER || 'stun:stun.l.google.com:19302'] },
        {
          urls: [process.env.TURN_SERVER || `turn:${domain}:3478`],
          username: 'turnuser',
          credential: 'turnpassword',
        },
      ],
    };
  }

  async getTurnCredentials(tenantId: string, agentId: string) {
    const domain = process.env.FREESWITCH_DOMAIN || '127.0.0.1';
    return {
      username: 'turnuser',
      credential: 'turnpassword',
      urls: [`turn:${domain}:3478`],
    };
  }

  // ── Voicemail Drop ────────────────────────────────────────────────────────

  async voicemailDrop(tenantId: string, callUUID: string, filePath: string) {
    this.logger.log(`[Tenant: ${tenantId}] dropping voicemail ${filePath} into ${callUUID}`);
    await this.freeswitch.playAudio(tenantId, callUUID, filePath);
  }

  async saveLocation(
    agentId: string,
    tenantId: string,
    data: { lat: number; lng: number; accuracy?: number; battery?: number },
  ) {
    const locationModel = (this.prisma as any).agentLocation;
    if (!locationModel) return;
    return locationModel.create({
      data: {
        agentId,
        tenantId,
        latitude: data.lat,
        longitude: data.lng,
        accuracy: data.accuracy,
        battery: data.battery,
      },
    });
  }
}
