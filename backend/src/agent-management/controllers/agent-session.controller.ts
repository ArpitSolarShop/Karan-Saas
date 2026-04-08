import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AgentSessionService } from '../services/agent-session.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('agent-management/sessions')
@UseGuards(JwtAuthGuard)
export class AgentSessionController {
  constructor(private readonly service: AgentSessionService) {}

  @Post('login')
  login(@Body() body: { agentId: string; tenantId: string; ipAddress?: string; userAgent?: string }) {
    return this.service.login(body.agentId, body.tenantId, body.ipAddress, body.userAgent);
  }

  @Post(':id/logout')
  logout(@Param('id') id: string) { return this.service.logout(id); }

  @Get('active/:agentId')
  getActiveSession(@Param('agentId') agentId: string) { return this.service.getActiveSession(agentId); }

  @Get('active')
  getActiveSessions(@Query('tenantId') tenantId: string) { return this.service.getActiveSessions(tenantId); }

  @Get('history/:agentId')
  getHistory(@Param('agentId') agentId: string, @Query('from') from?: string, @Query('to') to?: string, @Query('page') page?: string) {
    return this.service.getSessionHistory(agentId, from ? new Date(from) : undefined, to ? new Date(to) : undefined, page ? parseInt(page) : 1);
  }
}
