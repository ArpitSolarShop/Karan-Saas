import { Injectable, Logger } from '@nestjs/common';
import { DeepgramClient } from '@deepgram/sdk';
import { PrismaService } from '../prisma/prisma.service';
import { SearchService } from '../search/search.service';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private deepgram: DeepgramClient;

  // Sentiment keyword dictionaries
  private readonly POSITIVE_WORDS = [
    'interested',
    'yes',
    'great',
    'sure',
    'love',
    'perfect',
    'excellent',
    'definitely',
    'buy',
    'purchase',
  ];
  private readonly NEGATIVE_WORDS = [
    'no',
    'not interested',
    'busy',
    'expensive',
    'competitor',
    'cancel',
    'refund',
    'unhappy',
    'bad',
    'terrible',
  ];
  private readonly ALERT_KEYWORDS = [
    'competitor',
    'price',
    'refund',
    'cancel',
    'escalate',
    'manager',
    'complaint',
    'legal',
    'lawsuit',
  ];

  constructor(
    private prisma: PrismaService,
    private searchService: SearchService,
  ) {
    this.deepgram = new DeepgramClient(
      process.env.DEEPGRAM_API_KEY as any,
    ) as any;
  }

  /**
   * Transcribe a call recording from a URL.
   * Called after Twilio recording webhook fires.
   */
  async transcribeCall(callId: string, recordingUrl: string): Promise<any> {
    this.logger.log(`[AI] Transcribing call ${callId}`);

    try {
      const { result, error }: any = await (
        this.deepgram as any
      ).listen.prerecorded.transcribeUrl(
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
      const talkRatio =
        words.length > 0 ? Math.round((agentWords / words.length) * 100) : 50;

      // Sentiment analysis
      const sentiment = this.analyzeSentiment(transcript);
      const keywordsFound = this.extractKeywords(transcript);

      // Store transcript
      const transcriptRecord = await (this.prisma as any).callTranscript.upsert(
        {
          where: { callId },
          create: {
            callId,
            text: transcript,
            sentiment,
            keywordsFound,
            talkRatio,
            rawResult: result,
          },
          update: { text: transcript, sentiment, keywordsFound, talkRatio },
        },
      );

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
          notes: (call as any).notes || '',
          transcript,
          tenantId: call.tenantId,
          campaignId: call.campaignId || undefined,
        });
      }

      this.logger.log(
        `[AI] Transcript stored for call ${callId} | sentiment: ${sentiment} | keywords: ${keywordsFound.join(', ')}`,
      );
      return transcriptRecord;
    } catch (err) {
      this.logger.error(
        `[AI] Transcription failed for call ${callId}: ${(err as Error).message}`,
      );
      throw err;
    }
  }

  /** Simple rule-based sentiment analysis */
  private analyzeSentiment(text: string): 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' {
    const lower = text.toLowerCase();
    const positive = this.POSITIVE_WORDS.filter((w) =>
      lower.includes(w),
    ).length;
    const negative = this.NEGATIVE_WORDS.filter((w) =>
      lower.includes(w),
    ).length;

    if (positive > negative + 1) return 'POSITIVE';
    if (negative > positive + 1) return 'NEGATIVE';
    return 'NEUTRAL';
  }

  /** Extract alert keywords from transcript */
  private extractKeywords(text: string): string[] {
    const lower = text.toLowerCase();
    return this.ALERT_KEYWORDS.filter((kw) => lower.includes(kw));
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
   * Score a lead using basic heuristics (upgrade to ML in Phase 4).
   * Returns 0–100.
   */
  async scoreLeadHeuristic(leadId: string): Promise<number> {
    const lead: any = await this.prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        calls: { select: { status: true, talkTimeSeconds: true } },
        activities: { select: { activityType: true } },
      },
    });
    if (!lead) return 0;

    let score = 50; // Base

    // More calls = more engaged
    const calls = lead.calls || [];
    score += Math.min(calls.length * 5, 20);

    // Longer talk time = more interest
    const totalTalk = calls.reduce(
      (acc: number, c: any) => acc + (c.talkTimeSeconds || 0),
      0,
    );
    if (totalTalk > 300) score += 10;
    if (totalTalk > 600) score += 10;

    // Recent activity
    const activities = lead.activities || [];
    score += Math.min(activities.length * 2, 10);

    return Math.min(Math.max(score, 0), 100);
  }
}
