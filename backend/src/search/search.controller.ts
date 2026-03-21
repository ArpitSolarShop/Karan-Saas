import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  /**
   * Universal search — searches leads, contacts, and calls in one query.
   * GET /search?q=john&tenantId=xxx&limit=10
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async search(
    @Query('q') q: string,
    @Query('tenantId') tenantId?: string,
    @Query('limit') limit?: string,
  ) {
    if (!q || q.trim().length < 2)
      return { leads: [], contacts: [], calls: [], query: q };
    return this.searchService.search(q, {
      tenantId,
      limit: limit ? parseInt(limit) : 10,
    });
  }

  /**
   * Leads-only search with status filter.
   * GET /search/leads?q=john&status=FOLLOW_UP
   */
  @Get('leads')
  @UseGuards(JwtAuthGuard)
  async searchLeads(
    @Query('q') q: string,
    @Query('status') status?: string,
    @Query('tenantId') tenantId?: string,
  ) {
    if (!q) return { hits: [] };
    return this.searchService.searchLeads(q, { status, tenantId });
  }
}
