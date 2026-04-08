import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CdrService } from '../services/cdr.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('telephony/cdr')
@UseGuards(JwtAuthGuard)
export class CdrController {
  constructor(private readonly service: CdrService) {}

  @Get()
  findAll(
    @Query('tenantId') tenantId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('agentId') agentId?: string,
    @Query('campaignId') campaignId?: string,
    @Query('direction') direction?: string,
    @Query('disposition') disposition?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findAll(tenantId, {
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      agentId, campaignId, direction, disposition,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
    });
  }

  @Get('stats')
  getStats(
    @Query('tenantId') tenantId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.service.getStats(tenantId, from ? new Date(from) : undefined, to ? new Date(to) : undefined);
  }

  @Get('agent/:agentId/stats')
  getAgentStats(
    @Param('agentId') agentId: string,
    @Query('tenantId') tenantId: string,
    @Query('from') from?: string, @Query('to') to?: string,
  ) {
    return this.service.getAgentStats(tenantId, agentId, from ? new Date(from) : undefined, to ? new Date(to) : undefined);
  }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }
}
