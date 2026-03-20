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
    return true; // We can expand this to check ESL status via FreeswitchService getter
  }

  // ── Call Management ─────────────────────────────────────────────────────

  async initiateCall({ toNumber, leadId, agentId, campaignId }: { toNumber: string; leadId: string; agentId: string; campaignId?: string }) {
    const agent = await this.prisma.user.findUnique({ where: { id: agentId } });
    if (!agent || !agent.extension) throw new Error('Agent extension not found');
    
    // Commands FreeSWITCH to dial agent string, then bridge to customer
    const callUUID = await this.freeswitch.originateCall(agent.extension, toNumber);
    
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

  async transferCall(callUUID: string, targetExtension: string) {
    if (!this.freeswitch) throw new Error('Not connected');
    this.logger.log(`Transferring ${callUUID} to ${targetExtension}`);
    // FreeSWITCH command to execute a blind transfer:
    // uuid_transfer <uuid> <dest>
    // Assuming freeswitch.api takes direct commands if expanded, but for now we mock it or add it later
    return { callUUID, targetExtension };
  }

  async hangupCall(callUUID: string) {
    await this.freeswitch.hangup(callUUID);
    await this.prisma.call.updateMany({
      where: { telephonyCallSid: callUUID },
      data: { status: 'COMPLETED' as any },
    });
  }

  async muteCall(callUUID: string, mute: boolean) {
    this.logger.log(`Muted ${callUUID}: ${mute}`);
  }

  // ── Supervisor Controls ─────────────────────────────────────────────────

  async whisperToAgent(callUUID: string, supervisorExtension: string) {
    this.logger.log(`Whispering on ${callUUID} from ${supervisorExtension}`);
  }

  async bargeIn(callUUID: string, supervisorExtension: string) {
    this.logger.log(`Barging in on ${callUUID} from ${supervisorExtension}`);
  }

  // ── Recording ───────────────────────────────────────────────────────────

  async startRecording(callUUID: string) {
    this.logger.log(`Start recording ${callUUID}`);
    return `s3://bucket/recordings/${callUUID}.wav`;
  }

  async stopRecording(callUUID: string) {
    this.logger.log(`Stop recording ${callUUID}`);
  }

  // ── SIP.js Configuration ───────────────────────────────────────────────

  async getSipConfig(agentId: string) {
    const agent = await this.prisma.user.findUnique({ where: { id: agentId } });
    return {
      uri: `sip:${agent?.extension}@127.0.0.1`,
      wsServer: 'wss://127.0.0.1:7443',
      authorizationUser: agent?.extension,
      password: agent?.sipPassword || '1234',
    };
  }

  async getTurnCredentials(agentId: string) {
    return { username: 'turnuser', credential: 'turnpassword', urls: ['turn:127.0.0.1:3478'] };
  }

  // ── Voicemail Drop ────────────────────────────────────────────────────────

  async voicemailDrop(callUUID: string, filePath: string) {
    await this.freeswitch.dropVoicemail(callUUID, filePath);
  }

  async saveLocation(agentId: string, data: { lat: number; lng: number; accuracy?: number; battery?: number }) {
    return (this.prisma as any).agentLocation.create({
      data: {
        agentId,
        latitude: data.lat,
        longitude: data.lng,
        accuracy: data.accuracy,
        battery: data.battery,
      },
    });
  }
}