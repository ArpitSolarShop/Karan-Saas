import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Param,
  Req,
  Res,
} from '@nestjs/common';
import { TelephonyService } from './telephony.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Public } from '../auth/public.decorator';
import { TenantGuard } from '../auth/tenant.guard';

@Controller('telephony')
@UseGuards(JwtAuthGuard, TenantGuard)
export class TelephonyController {
  constructor(private readonly telephonyService: TelephonyService) {}

  // ── Call Management ─────────────────────────────────────────────────────

  /** Initiate outbound call — agent clicks "Call" in CRM */
  @Post('call')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async initiateCall(
    @Body()
    body: {
      toNumber: string;
      leadId: string;
      agentId: string;
      campaignId?: string;
    },
    @Req() req: any,
  ) {
    const { tenantId, ...rest } = body as any;
    const callUUID = await this.telephonyService.initiateCall(req.user.tenantId, { ...body });
    return { callUUID, message: 'Call initiated via FreeSWITCH' };
  }

  /** Transfer call to another agent extension */
  @Post('transfer')
  async transfer(@Body() body: { callUUID: string; targetExtension: string }, @Req() req: any) {
    await this.telephonyService.transferCall(
      req.user.tenantId,
      body.callUUID,
      body.targetExtension,
    );
    return { success: true };
  }

  /** Hang up a specific call (supervisor or agent) */
  @Post('hangup')
  async hangup(@Body() body: { callUUID: string }, @Req() req: any) {
    await this.telephonyService.hangupCall(req.user.tenantId, body.callUUID);
    return { success: true };
  }

  /** Mute / unmute a call leg */
  @Post('mute')
  async mute(@Body() body: { callUUID: string; mute: boolean }, @Req() req: any) {
    await this.telephonyService.muteCall(req.user.tenantId, body.callUUID, body.mute);
    return { success: true };
  }

  /** Hold / unhold a call */
  @Post('hold')
  async hold(@Body() body: { callUUID: string; hold: boolean }, @Req() req: any) {
    await this.telephonyService.holdCall(req.user.tenantId, body.callUUID, body.hold);
    return { success: true };
  }

  // ── Supervisor Controls ─────────────────────────────────────────────────

  /** Supervisor whisper — speak to agent, customer can't hear */
  @Post('whisper')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'MANAGER', 'SUPERVISOR')
  async whisper(
    @Body() body: { callUUID: string; supervisorExtension: string },
    @Req() req: any,
  ) {
    await this.telephonyService.whisperToAgent(
      req.user.tenantId,
      body.callUUID,
      body.supervisorExtension,
    );
    return { success: true, message: 'Whisper mode activated' };
  }

  /** Supervisor barge-in — full 3-way conference join */
  @Post('barge')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'MANAGER', 'SUPERVISOR')
  async barge(@Body() body: { callUUID: string; supervisorExtension: string }, @Req() req: any) {
    await this.telephonyService.bargeIn(
      req.user.tenantId,
      body.callUUID,
      body.supervisorExtension,
    );
    return { success: true, message: 'Barged into call' };
  }

  /** Supervisor silent monitor — listen-only, neither agent nor customer hears */
  @Post('monitor')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'MANAGER', 'SUPERVISOR')
  async silentMonitor(
    @Body() body: { callUUID: string; supervisorExtension: string },
    @Req() req: any,
  ) {
    await this.telephonyService.silentMonitor(
      req.user.tenantId,
      body.callUUID,
      body.supervisorExtension,
    );
    return { success: true, message: 'Silent monitor activated' };
  }

  /** Send DTMF tones on a live call (RFC 2833) */
  @Post('dtmf')
  async sendDtmf(@Body() body: { callUUID: string; digits: string }, @Req() req: any) {
    await this.telephonyService.sendDtmf(req.user.tenantId, body.callUUID, body.digits);
    return { success: true };
  }

  // ── Recording ───────────────────────────────────────────────────────────

  /** Start recording a call */
  @Post('record/start')
  async startRecord(@Body() body: { callUUID: string }, @Req() req: any) {
    const path = await this.telephonyService.startRecording(req.user.tenantId, body.callUUID);
    return { recording: true, path };
  }

  /** Stop recording */
  @Post('record/stop')
  async stopRecord(@Body() body: { callUUID: string }, @Req() req: any) {
    await this.telephonyService.stopRecording(req.user.tenantId, body.callUUID);
    return { recording: false };
  }

  // ── SIP.js Browser Configuration ────────────────────────────────────────

  /**
   * Get SIP config + TURN credentials for the browser SIP.js client.
   * Called by frontend when agent opens softphone.
   */
  @Get('sip-config')
  getSipConfig(@Query('agentId') agentId: string, @Req() req: any) {
    return this.telephonyService.getSipConfig(req.user.tenantId, agentId);
  }

  /** Get only TURN credentials (for WebRTC ICE) */
  @Get('turn-credentials')
  getTurnCredentials(@Query('agentId') agentId: string, @Req() req: any) {
    return this.telephonyService.getTurnCredentials(req.user.tenantId, agentId);
  }

  /** Health — returns FreeSWITCH ESL connection status */
  @Get('status')
  getStatus(@Req() req: any) {
    return {
      freeSWITCH: this.telephonyService.isConnected
        ? 'connected'
        : 'disconnected',
      mode: this.telephonyService.isConnected
        ? 'freesWITCH-webrtc'
        : 'sim-based-fallback',
    };
  }

  // ── Voicemail Drop ────────────────────────────────────────────────────────

  /** Upload a voicemail WAV file for drop use */
  @Post('voicemail/upload')
  async uploadVoicemail(@Req() req: any, @Res() res: any): Promise<void> {
    const multer = require('multer');
    const path = require('path');
    const fs = require('fs');
    const dir = path.join(process.cwd(), 'voicemails');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const storage = multer.diskStorage({
      destination: (_req: any, _file: any, cb: any) => cb(null, dir),
      filename: (_req: any, file: any, cb: any) =>
        cb(null, `${Date.now()}-${file.originalname}`),
    });
    const upload = multer({ storage }).single('file');
    upload(req, res, (err: any) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      const filePath = req.file?.path;
      if (!filePath) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }
      res.json({ path: filePath, filename: req.file.filename });
    });
  }

  /** Drop pre-recorded voicemail into live call via FreeSWITCH ESL */
  @Post('voicemail/drop')
  async voicemailDrop(@Body() body: { callUUID: string; filePath: string }, @Req() req: any) {
    await this.telephonyService.voicemailDrop(req.user.tenantId, body.callUUID, body.filePath);
    return { success: true };
  }

  /** Record Agent GPS Location (for Field Agents) */
  @Post('location')
  async recordLocation(
    @Req() req: any,
    @Body()
    body: { lat: number; lng: number; accuracy?: number; battery?: number },
  ) {
    return this.telephonyService.saveLocation(req.user.id, req.user.tenantId, body);
  }
}
