import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FreeswitchService } from './freeswitch.service';
import { TelephonyGateway } from './telephony.gateway';

@Injectable()
export class TelephonyService {
  private readonly logger = new Logger(TelephonyService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly freeswitch: FreeswitchService,
    @Inject(forwardRef(() => TelephonyGateway))
    private readonly gateway: TelephonyGateway,
  ) {}

  /** Actual ESL connection state — delegates to FreeswitchService */
  get isConnected(): boolean {
    return this.freeswitch.isConnected;
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
    this.logger.log(`[Tenant: ${tenantId}] ${mute ? 'Muting' : 'Unmuting'} ${callUUID}`);
    await this.freeswitch.muteCall(callUUID, mute);
  }

  async holdCall(tenantId: string, callUUID: string, hold: boolean) {
    this.logger.log(`[Tenant: ${tenantId}] ${hold ? 'Holding' : 'Resuming'} ${callUUID}`);
    if (hold) {
      await this.freeswitch.holdCall(callUUID);
    } else {
      await this.freeswitch.unholdCall(callUUID);
    }
  }

  // ── Supervisor Controls ─────────────────────────────────────────────────

  async whisperToAgent(tenantId: string, callUUID: string, supervisorExtension: string) {
    this.logger.log(`[Tenant: ${tenantId}] Whispering on ${callUUID} from ${supervisorExtension}`);
    await this.freeswitch.eavesdropWhisper(callUUID, supervisorExtension);
  }

  async bargeIn(tenantId: string, callUUID: string, supervisorExtension: string) {
    this.logger.log(`[Tenant: ${tenantId}] Barging in on ${callUUID} from ${supervisorExtension}`);
    await this.freeswitch.bargeIn(callUUID, supervisorExtension);
  }

  /** Supervisor silent monitor — listen-only eavesdrop (no whisper) */
  async silentMonitor(tenantId: string, callUUID: string, supervisorExtension: string) {
    this.logger.log(`[Tenant: ${tenantId}] Silent monitor on ${callUUID} from ${supervisorExtension}`);
    await this.freeswitch.silentMonitor(callUUID, supervisorExtension);
  }

  /** Send DTMF tones on a live call */
  async sendDtmf(tenantId: string, callUUID: string, digits: string) {
    this.logger.log(`[Tenant: ${tenantId}] Sending DTMF '${digits}' on ${callUUID}`);
    await this.freeswitch.sendDtmf(callUUID, digits);
  }

  // ── Recording ───────────────────────────────────────────────────────────

  async startRecording(tenantId: string, callUUID: string) {
    this.logger.log(`[Tenant: ${tenantId}] Start recording ${callUUID}`);
    const filePath = `/var/lib/freeswitch/recordings/${tenantId}/${callUUID}.wav`;
    await this.freeswitch.startRecording(callUUID, filePath);
    return filePath;
  }

  async stopRecording(tenantId: string, callUUID: string) {
    this.logger.log(`[Tenant: ${tenantId}] Stop recording ${callUUID}`);
    const filePath = `/var/lib/freeswitch/recordings/${tenantId}/${callUUID}.wav`;
    await this.freeswitch.stopRecording(callUUID, filePath);
  }

  /** Mark call as answered in DB */
  async markCallAnswered(tenantId: string, callUUID: string) {
    await this.prisma.call.updateMany({
      where: { telephonyCallSid: callUUID, tenantId },
      data: { status: 'CONNECTED' as any },
    });
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
          username: process.env.TURN_USERNAME || 'turnuser',
          credential: process.env.TURN_PASSWORD || 'turnpassword',
        },
      ],
    };
  }

  async getTurnCredentials(tenantId: string, agentId: string) {
    const domain = process.env.FREESWITCH_DOMAIN || '127.0.0.1';
    return {
      username: process.env.TURN_USERNAME || 'turnuser',
      credential: process.env.TURN_PASSWORD || 'turnpassword',
      urls: [process.env.TURN_SERVER || `turn:${domain}:3478`],
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
