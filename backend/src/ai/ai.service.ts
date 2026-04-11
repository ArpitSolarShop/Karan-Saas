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
    this.deepgram = new DeepgramClient({
      apiKey: this.config.get<string>('DEEPGRAM_API_KEY') || '',
    });

    const aiKey = this.config.get<string>('GROQ_API_KEY') || this.config.get<string>('OPENAI_API_KEY');
    
    // We will use standard OpenAI SDK but repointed to an Open Source proxy 
    // Defaults to Groq for ultra-fast Llama/Gemma. Falls back to OpenAI if standard key.
    const isGroq = !!this.config.get<string>('GROQ_API_KEY');
    
    this.openai = new OpenAI({
      apiKey: aiKey || 'sk-placeholder-key-not-configured',
      baseURL: isGroq ? 'https://api.groq.com/openai/v1' : 'https://api.openai.com/v1',
    });
    
    if (!aiKey) {
      this.logger.warn('[AI] Neither GROQ_API_KEY nor OPENAI_API_KEY found — AI features disabled');
    } else {
      this.logger.log(`[AI] Initialized with Open-Weights Compatible Engine. Provider: ${isGroq ? 'Groq (Llama/Gemma)' : 'Standard LLM'}`);
    }
  }

  private getDefaultModel(): string {
     return this.config.get<string>('GROQ_API_KEY') ? 'llama3-8b-8192' : 'gpt-4o-mini';
  }

  /**
   * LLM-powered Sentiment Analysis & Summarization
   */
  async analyzeWithLLM(text: string): Promise<{ sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'; summary: string; keywords: string[] }> {
    if (!this.config.get('OPENAI_API_KEY') && !this.config.get('GROQ_API_KEY')) {
      this.logger.warn('[AI] OPENAI_API_KEY missing - falling back to Neutral');
      return { sentiment: 'NEUTRAL', summary: 'AI Analysis skipped (API Key missing)', keywords: [] };
    }

    try {
      const model = this.getDefaultModel();
      const response = await this.openai.chat.completions.create({
        model: model,
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
  async getTranscript(tenantId: string, callId: string) {
    return (this.prisma as any).callTranscript.findFirst({
      where: { callId, call: { tenantId } },
    });
  }

  /**
   * Score a lead using AI heuristics and call history.
   * Returns 0–100.
   */
  async scoreLead(tenantId: string, leadId: string): Promise<number> {
    const lead = await this.prisma.lead.findFirst({
      where: { id: leadId, tenantId },
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

  /**
   * Evaluates a Lead based on their initial CRM context.
   * Used heavily by the native Backend Automation Workflow Engine.
   */
  async evaluateLeadAction(leadContext: any): Promise<{ summary: string; suggestedPriority: 'HIGH' | 'MEDIUM' | 'LOW' }> {
    const aiKey = this.config.get<string>('GROQ_API_KEY') || this.config.get<string>('OPENAI_API_KEY');
    if (!aiKey) {
       return { summary: 'AI grading skipped (no provider injected).', suggestedPriority: 'MEDIUM' };
    }

    try {
      // Opt to use Gemma 2 if we are on Groq, else fallback to standard Llama3 or GPT
      const model = this.config.get<string>('GROQ_API_KEY') ? 'gemma2-9b-it' : this.getDefaultModel();
      
      const payloadContext = JSON.stringify({
        name: leadContext.leadName || 'Unknown Lead',
        email: leadContext.email || 'N/A',
        source: leadContext.source || 'Direct',
        notes: leadContext.initialNotes || 'No notes provided',
      });

      this.logger.log(`[AI] Grading Lead Context via ${model}: ${leadContext.leadId}`);

      const response = await this.openai.chat.completions.create({
        model: model,
        temperature: 0.1,
        messages: [
          {
            role: 'system',
            content: `You are an AI Lead Grader. Given the JSON dump of a newly arrived Sales Lead, output a strictly formatted JSON dict containing "summary" (A 2 sentence assessment of this lead's value based on standard B2B heuristic rules) and "suggestedPriority" (Must be exactly one of "HIGH", "MEDIUM", or "LOW").`
          },
          { role: 'user', content: payloadContext }
        ],
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return {
         summary: result.summary || 'Analyzed via Open Weights.',
         suggestedPriority: result.suggestedPriority || 'MEDIUM',
      };
    } catch (err) {
      this.logger.error(`[AI] evaluateLeadAction failed: ${err.message}`);
      return { summary: `Error: ${err.message}`, suggestedPriority: 'MEDIUM' };
    }
  }
}
