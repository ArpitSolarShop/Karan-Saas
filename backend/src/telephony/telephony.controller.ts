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

@Controller('telephony')
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
  ) {
    const callUUID = await this.telephonyService.initiateCall(body);
    return { callUUID, message: 'Call initiated via FreeSWITCH' };
  }

  /** Transfer call to another agent extension */
  @Post('transfer')
  @UseGuards(JwtAuthGuard)
  async transfer(@Body() body: { callUUID: string; targetExtension: string }) {
    await this.telephonyService.transferCall(
      body.callUUID,
      body.targetExtension,
    );
    return { success: true };
  }

  /** Hang up a specific call (supervisor or agent) */
  @Post('hangup')
  @UseGuards(JwtAuthGuard)
  async hangup(@Body() body: { callUUID: string }) {
    await this.telephonyService.hangupCall(body.callUUID);
    return { success: true };
  }

  /** Mute / unmute a call leg */
  @Post('mute')
  @UseGuards(JwtAuthGuard)
  async mute(@Body() body: { callUUID: string; mute: boolean }) {
    await this.telephonyService.muteCall(body.callUUID, body.mute);
    return { success: true };
  }

  // ── Supervisor Controls ─────────────────────────────────────────────────

  /** Supervisor whisper — speak to agent, customer can't hear */
  @Post('whisper')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'MANAGER', 'SUPERVISOR')
  async whisper(
    @Body() body: { callUUID: string; supervisorExtension: string },
  ) {
    await this.telephonyService.whisperToAgent(
      body.callUUID,
      body.supervisorExtension,
    );
    return { success: true, message: 'Whisper mode activated' };
  }

  /** Supervisor barge-in — full 3-way conference join */
  @Post('barge')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'MANAGER', 'SUPERVISOR')
  async barge(@Body() body: { callUUID: string; supervisorExtension: string }) {
    await this.telephonyService.bargeIn(
      body.callUUID,
      body.supervisorExtension,
    );
    return { success: true, message: 'Barged into call' };
  }

  // ── Recording ───────────────────────────────────────────────────────────

  /** Start recording a call */
  @Post('record/start')
  @UseGuards(JwtAuthGuard)
  async startRecord(@Body() body: { callUUID: string }) {
    const path = await this.telephonyService.startRecording(body.callUUID);
    return { recording: true, path };
  }

  /** Stop recording */
  @Post('record/stop')
  @UseGuards(JwtAuthGuard)
  async stopRecord(@Body() body: { callUUID: string }) {
    await this.telephonyService.stopRecording(body.callUUID);
    return { recording: false };
  }

  // ── SIP.js Browser Configuration ────────────────────────────────────────

  /**
   * Get SIP config + TURN credentials for the browser SIP.js client.
   * Called by frontend when agent opens softphone.
   */
  @Get('sip-config')
  @UseGuards(JwtAuthGuard)
  getSipConfig(@Query('agentId') agentId: string) {
    return this.telephonyService.getSipConfig(agentId);
  }

  /** Get only TURN credentials (for WebRTC ICE) */
  @Get('turn-credentials')
  @UseGuards(JwtAuthGuard)
  getTurnCredentials(@Query('agentId') agentId: string) {
    return this.telephonyService.getTurnCredentials(agentId);
  }

  /** Health — returns FreeSWITCH ESL connection status */
  @Get('status')
  @UseGuards(JwtAuthGuard)
  getStatus() {
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  async voicemailDrop(@Body() body: { callUUID: string; filePath: string }) {
    await this.telephonyService.voicemailDrop(body.callUUID, body.filePath);
    return { success: true };
  }

  /** Record Agent GPS Location (for Field Agents) */
  @Post('location')
  @UseGuards(JwtAuthGuard)
  async recordLocation(
    @Req() req: any,
    @Body()
    body: { lat: number; lng: number; accuracy?: number; battery?: number },
  ) {
    return this.telephonyService.saveLocation(req.user.id, body);
  }
}
