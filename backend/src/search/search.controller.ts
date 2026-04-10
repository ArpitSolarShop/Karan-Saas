import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';

@Controller('search')
@UseGuards(JwtAuthGuard, TenantGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  /**
   * Universal search — searches leads, contacts, and calls in one query.
   * GET /search?q=john&tenantId=xxx&limit=10
   */
  @Get()
  async search(
    @Query('q') q: string,
    @Req() req: any,
    @Query('limit') limit?: string,
  ) {
    if (!q || q.trim().length < 2)
      return { leads: [], contacts: [], calls: [], query: q };
    return this.searchService.search(q, {
      tenantId: req.user.tenantId,
      limit: limit ? parseInt(limit) : 10,
    });
  }

  /**
   * Leads-only search with status filter.
   * GET /search/leads?q=john&status=FOLLOW_UP
   */
  @Get('leads')
  async searchLeads(
    @Query('q') q: string,
    @Req() req: any,
    @Query('status') status?: string,
  ) {
    if (!q) return { hits: [] };
    return this.searchService.searchLeads(q, { status, tenantId: req.user.tenantId });
  }
}
