import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /** Called by Twilio recording webhook after a call recording is ready */
  @Post('transcribe')
  @Public()
  async transcribe(@Body() body: { callId: string; recordingUrl: string }) {
    const result = await this.aiService.transcribeCall(body.callId, body.recordingUrl);
    return { success: true, transcriptId: result?.id };
  }

  /** Get transcript for a specific call */
  @Get('transcript/:callId')
  @UseGuards(JwtAuthGuard)
  async getTranscript(@Param('callId') callId: string) {
    return this.aiService.getTranscript(callId);
  }

  /** Score a lead */
  @Get('score/:leadId')
  @UseGuards(JwtAuthGuard)
  async scoreLead(@Param('leadId') leadId: string) {
    const score = await this.aiService.scoreLeadHeuristic(leadId);
    return { leadId, score };
  }
}
