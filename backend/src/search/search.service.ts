import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { MeiliSearch } from 'meilisearch';

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);
  private client: MeiliSearch;

  constructor() {
    this.client = new MeiliSearch({
      host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
      apiKey: process.env.MEILISEARCH_API_KEY || 'alpha-search-key',
    });
  }

  async onModuleInit() {
    try {
      // Configure leads index
      await this.client.index('leads').updateSettings({
        searchableAttributes: [
          'name',
          'firstName',
          'phone',
          'email',
          'city',
          'company',
          'source',
          'notes',
        ],
        filterableAttributes: [
          'status',
          'score',
          'tenantId',
          'source',
          'campaignId',
          'assignedTo',
        ],
        sortableAttributes: ['createdAt', 'score', 'name'],
        rankingRules: [
          'words',
          'typo',
          'proximity',
          'attribute',
          'sort',
          'exactness',
        ],
      });

      // Configure contacts index
      await this.client.index('contacts').updateSettings({
        searchableAttributes: ['name', 'email', 'phone', 'company'],
        filterableAttributes: ['tenantId'],
      });

      // Configure calls index
      await this.client.index('calls').updateSettings({
        searchableAttributes: ['notes', 'transcript', 'leadName', 'agentName'],
        filterableAttributes: ['tenantId', 'status', 'campaignId'],
        sortableAttributes: ['createdAt'],
      });

      this.logger.log('[Search] Meilisearch indices configured');
    } catch (e) {
      this.logger.warn(
        '[Search] Meilisearch not ready — will retry on next operation',
      );
    }
  }

  // ── Leads ──
  async indexLead(lead: any) {
    try {
      return this.client
        .index('leads')
        .addDocuments([{ ...lead, id: lead.id }]);
    } catch (err: any) {
      this.logger.error(`[Search] Failed to index lead: ${err.message}`);
      return null;
    }
  }

  async updateLeadIndex(lead: any) {
    try {
      return this.client
        .index('leads')
        .updateDocuments([{ ...lead, id: lead.id }]);
    } catch (err: any) {
      this.logger.error(`[Search] Failed to update lead index: ${err.message}`);
      return null;
    }
  }

  async deleteLeadFromIndex(leadId: string) {
    try {
      return this.client.index('leads').deleteDocument(leadId);
    } catch (err: any) {
      this.logger.error(`[Search] Failed to delete lead from index: ${err.message}`);
      return null;
    }
  }

  // ── Universal search ──
  async search(query: string, options: { tenantId: string; limit?: number }) {
    const filter = `tenantId = '${options.tenantId}'`;
    const limit = options.limit || 10;

    const [leads, contacts, calls] = await Promise.allSettled([
      this.client.index('leads').search(query, { filter, limit }),
      this.client.index('contacts').search(query, { filter, limit }),
      this.client.index('calls').search(query, { filter, limit }),
    ]);

    return {
      leads: leads.status === 'fulfilled' ? leads.value.hits : [],
      contacts: contacts.status === 'fulfilled' ? contacts.value.hits : [],
      calls: calls.status === 'fulfilled' ? calls.value.hits : [],
      query,
    };
  }

  async searchLeads(
    query: string,
    filters: { status?: string; tenantId: string },
  ) {
    const filterParts: string[] = [`tenantId = '${filters.tenantId}'`];
    if (filters.status) filterParts.push(`status = '${filters.status}'`);

    return this.client.index('leads').search(query, {
      filter: filterParts.join(' AND '),
      limit: 20,
    });
  }

  // ── Index a call transcript ──
  async indexCallTranscript(call: {
    id: string;
    leadName: string;
    agentName: string;
    notes: string;
    transcript: string;
    tenantId: string;
    campaignId?: string;
  }) {
    try {
      return this.client.index('calls').addDocuments([call]);
    } catch (err: any) {
      this.logger.error(`[Search] Failed to index call transcript: ${err.message}`);
      return null;
    }
  }
}
