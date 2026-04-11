import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { CdrService } from '../services/cdr.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { TenantGuard } from "../../auth/tenant.guard";

@Controller('telephony/cdr')
@UseGuards(JwtAuthGuard, TenantGuard)
export class CdrController {
  constructor(private readonly service: CdrService) {}

  @Get()
  findAll(
    @Req() req: any, @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('agentId') agentId?: string,
    @Query('campaignId') campaignId?: string,
    @Query('direction') direction?: string,
    @Query('disposition') disposition?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findAll(req.user.tenantId, {
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      agentId, campaignId, direction, disposition,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
    });
  }

  @Get('stats')
  getStats(
    @Req() req: any, @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.service.getStats(req.user.tenantId, from ? new Date(from) : undefined, to ? new Date(to) : undefined);
  }

  @Get('agent/:agentId/stats')
  getAgentStats(
    @Req() req: any, @Param('agentId') agentId: string,
    @Query('from') from?: string, @Query('to') to?: string,
  ) {
    return this.service.getAgentStats(req.user.tenantId, agentId, from ? new Date(from) : undefined, to ? new Date(to) : undefined);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) { return this.service.findOne(req.user.tenantId, id); }
}
