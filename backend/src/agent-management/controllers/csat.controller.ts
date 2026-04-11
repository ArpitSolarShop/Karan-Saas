import { Controller, Get, Post, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { CsatService } from '../services/csat.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { TenantGuard } from "../../auth/tenant.guard";

@Controller('agent-management/csat')
@UseGuards(JwtAuthGuard, TenantGuard)
export class CsatController {
  constructor(private readonly service: CsatService) {}

  @Post()
  create(@Req() req: any, @Body() body: any) { return this.service.create(req.user.tenantId, body); }

  @Get()
  findAll(@Req() req: any, @Query('page') page?: string, @Query('agentId') agentId?: string) {
    return this.service.findAll(req.user.tenantId, page ? parseInt(page) : 1, 50, agentId);
  }

  @Get('stats')
  getStats(@Req() req: any, @Query('from') from?: string, @Query('to') to?: string) {
    return this.service.getStats(req.user.tenantId, from ? new Date(from) : undefined, to ? new Date(to) : undefined);
  }

  @Get('agent/:agentId')
  getAgentCsat(@Req() req: any, @Param('agentId') agentId: string) { return this.service.getAgentCsat(req.user.tenantId, agentId); }
}
