import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { CsatService } from '../services/csat.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('agent-management/csat')
@UseGuards(JwtAuthGuard)
export class CsatController {
  constructor(private readonly service: CsatService) {}

  @Post()
  create(@Body() body: any) { return this.service.create(body); }

  @Get()
  findAll(@Query('tenantId') tenantId: string, @Query('page') page?: string, @Query('agentId') agentId?: string) {
    return this.service.findAll(tenantId, page ? parseInt(page) : 1, 50, agentId);
  }

  @Get('stats')
  getStats(@Query('tenantId') tenantId: string, @Query('from') from?: string, @Query('to') to?: string) {
    return this.service.getStats(tenantId, from ? new Date(from) : undefined, to ? new Date(to) : undefined);
  }

  @Get('agent/:agentId')
  getAgentCsat(@Param('agentId') agentId: string) { return this.service.getAgentCsat(agentId); }
}
