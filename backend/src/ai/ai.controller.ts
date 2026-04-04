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
    const result = await this.aiService.transcribeCall(
      body.callId,
      body.recordingUrl,
    );
    return { success: true, transcriptId: result?.id };
  }

  /** Get transcript for a specific call */
  @Get('transcript/:callId')
  @UseGuards(JwtAuthGuard)
  async getTranscript(@Param('callId') callId: string) {
    return this.aiService.getTranscript(callId);
  }

  /** Get sentiment analytics for wallboard */
  @Get('analytics/sentiment')
  @UseGuards(JwtAuthGuard)
  async getSentimentAnalytics() {
    // Basic aggregation: normally we'd do this in a service with Prisma 
    // For now, return recent call transcripts with sentiment
    return (this.aiService as any).prisma.callTranscript.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: {
        call: {
          include: {
            lead: { select: { name: true } },
            agent: { select: { firstName: true, lastName: true } }
          }
        }
      }
    });
  }

  /** Score a lead using AI */
  @Get('score/:leadId')
  @UseGuards(JwtAuthGuard)
  async scoreLead(@Param('leadId') leadId: string) {
    const score = await this.aiService.scoreLead(leadId);
    return { leadId, score };
  }
}
