import { Controller, Get, Post, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { AgentSessionService } from '../services/agent-session.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { TenantGuard } from "../../auth/tenant.guard";

@Controller('agent-management/sessions')
@UseGuards(JwtAuthGuard, TenantGuard)
export class AgentSessionController {
  constructor(private readonly service: AgentSessionService) {}

  login(@Req() req: any, @Body() body: { agentId: string; ipAddress?: string; userAgent?: string }) {
    return this.service.login(req.user.tenantId, body.agentId, body.ipAddress, body.userAgent);
  }

  @Post(':id/logout')
  logout(@Req() req: any, @Param('id') id: string) { return this.service.logout(req.user.tenantId, id); }

  @Get('active/:agentId')
  getActiveSession(@Req() req: any, @Param('agentId') agentId: string) { return this.service.getActiveSession(req.user.tenantId, agentId); }

  @Get('active')
  getActiveSessions(@Req() req: any) { return this.service.getActiveSessions(req.user.tenantId); }

  @Get('history/:agentId')
  getHistory(@Req() req: any, @Param('agentId') agentId: string, @Query('from') from?: string, @Query('to') to?: string, @Query('page') page?: string) {
    return this.service.getSessionHistory(req.user.tenantId, agentId, from ? new Date(from) : undefined, to ? new Date(to) : undefined, page ? parseInt(page) : 1);
  }
}
