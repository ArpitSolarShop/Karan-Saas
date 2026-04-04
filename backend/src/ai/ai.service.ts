import { Injectable, Logger } from '@nestjs/common';
import { DeepgramClient } from '@deepgram/sdk';
import { PrismaService } from '../prisma/prisma.service';
import { SearchService } from '../search/search.service';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private deepgram: DeepgramClient;
  private openai: OpenAI;

  constructor(
    private prisma: PrismaService,
    private searchService: SearchService,
    private config: ConfigService,
  ) {
    this.deepgram = new DeepgramClient(
      this.config.get<string>('DEEPGRAM_API_KEY') as string,
    );

    this.openai = new OpenAI({
      apiKey: this.config.get<string>('OPENAI_API_KEY'),
    });
  }

  /**
   * LLM-powered Sentiment Analysis & Summarization
   */
  async analyzeWithLLM(text: string): Promise<{ sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'; summary: string; keywords: string[] }> {
    if (!this.config.get('OPENAI_API_KEY')) {
      this.logger.warn('[AI] OPENAI_API_KEY missing - falling back to Neutral');
      return { sentiment: 'NEUTRAL', summary: 'AI Analysis skipped (API Key missing)', keywords: [] };
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Analyze this call transcript. Return ONLY a JSON object with: 
            1. sentiment: "POSITIVE", "NEGATIVE", or "NEUTRAL"
            2. summary: A 2-sentence summary of the call.
            3. keywords: Array of 3-5 key topics mentioned.`
          },
          { role: 'user', content: text }
        ],
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return {
        sentiment: (result.sentiment?.toUpperCase() as any) || 'NEUTRAL',
        summary: result.summary || '',
        keywords: result.keywords || []
      };
    } catch (err) {
      this.logger.error(`[AI] LLM Analysis failed: ${err.message}`);
      return { sentiment: 'NEUTRAL', summary: 'Analysis failed', keywords: [] };
    }
  }

  /**
   * Transcribe a call recording from a URL.
   * Called after Twilio recording webhook fires.
   */
  async transcribeCall(callId: string, recordingUrl: string): Promise<any> {
    this.logger.log(`[AI] Transcribing call ${callId}`);

    try {
      const { result, error }: any = await (this.deepgram as any).listen.prerecorded.transcribeUrl(
        { url: recordingUrl },
        {
          model: 'nova-2',
          smart_format: true,
          diarize: true, // Speaker separation
          punctuate: true,
          language: 'en',
        },
      );

      if (error) throw new Error(error.message);

      const transcript = result.results.channels[0].alternatives[0].transcript;
      const words = result.results.channels[0].alternatives[0].words || [];

      // Calculate talk ratio
      const agentWords = words.filter((w: any) => w.speaker === 0).length;
      const customerWords = words.filter((w: any) => w.speaker === 1).length;
      const talkRatio = words.length > 0 ? Math.round((agentWords / words.length) * 100) : 50;

      // LLM Analysis
      const { sentiment, summary, keywords } = await this.analyzeWithLLM(transcript);

      // Store transcript
      const transcriptRecord = await (this.prisma as any).callTranscript.upsert({
        where: { callId },
        create: {
          callId,
          text: transcript,
          sentiment,
          summary,
          keywordsFound: keywords,
          talkRatio,
          rawResult: result,
        },
        update: { 
          text: transcript, 
          sentiment, 
          summary, 
          keywordsFound: keywords, 
          talkRatio 
        },
      });

      // Index in Meilisearch for search
      const call = await this.prisma.call.findUnique({
        where: { id: callId },
        include: {
          lead: { select: { name: true } },
          agent: { select: { firstName: true, lastName: true } },
        },
      });

      if (call) {
        await this.searchService.indexCallTranscript({
          id: callId,
          leadName: call.lead?.name || '',
          agentName: `${call.agent?.firstName} ${call.agent?.lastName}`,
          notes: (call as any).notes || summary || '',
          transcript,
          tenantId: call.tenantId,
          campaignId: call.campaignId || undefined,
        });
      }

      this.logger.log(`[AI] Analysis complete for call ${callId} | Sentiment: ${sentiment}`);
      return transcriptRecord;
    } catch (err) {
      this.logger.error(`[AI] Transcription failed for call ${callId}: ${err.message}`);
      throw err;
    }
  }

  /**
   * Get transcript for a specific call.
   */
  async getTranscript(callId: string) {
    return (this.prisma as any).callTranscript.findUnique({
      where: { callId },
    });
  }

  /**
   * Score a lead using AI heuristics and call history.
   * Returns 0–100.
   */
  async scoreLead(leadId: string): Promise<number> {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        calls: { 
          include: { transcript: true },
          orderBy: { createdAt: 'desc' },
          take: 5
        },
      },
    });

    if (!lead) return 0;

    let totalScore = 50; // Neutral starting point

    // Analysis based on last 5 calls
    for (const call of lead.calls) {
      if (call.transcript) {
        if (call.transcript.sentiment === 'POSITIVE') totalScore += 10;
        if (call.transcript.sentiment === 'NEGATIVE') totalScore -= 15;
      }
      
      if (call.status === 'COMPLETED' && (call.talkTimeSeconds || 0) > 120) {
        totalScore += 5;
      }
    }

    return Math.min(Math.max(totalScore, 0), 100);
  }
}
