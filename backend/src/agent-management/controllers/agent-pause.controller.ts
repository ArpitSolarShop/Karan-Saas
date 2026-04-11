import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { AgentPauseService } from '../services/agent-pause.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { TenantGuard } from "../../auth/tenant.guard";

@Controller('agent-management/pauses')
@UseGuards(JwtAuthGuard, TenantGuard)
export class AgentPauseController {
  constructor(private readonly service: AgentPauseService) {}

  // Pause Codes
  @Post('codes')
  createCode(@Req() req: any, @Body() body: any) { return this.service.createPauseCode(req.user.tenantId, body); }

  @Get('codes')
  findAllCodes(@Req() req: any) { return this.service.findAllPauseCodes(req.user.tenantId); }

  @Patch('codes/:id')
  updateCode(@Req() req: any, @Param('id') id: string, @Body() body: any) { return this.service.updatePauseCode(req.user.tenantId, id, body); }

  @Delete('codes/:id')
  deleteCode(@Req() req: any, @Param('id') id: string) { return this.service.deletePauseCode(req.user.tenantId, id); }

  // Agent pauses
  startPause(@Req() req: any, @Body() body: { sessionId: string; pauseCodeId: string; notes?: string }) {
    return this.service.startPause(req.user.tenantId, body.sessionId, body.pauseCodeId, body.notes);
  }

  @Post(':id/end')
  endPause(@Req() req: any, @Param('id') id: string) { return this.service.endPause(req.user.tenantId, id); }

  @Get('active/:sessionId')
  getActive(@Req() req: any, @Param('sessionId') sessionId: string) { return this.service.getActivePause(req.user.tenantId, sessionId); }

  @Get('history/:sessionId')
  getHistory(@Req() req: any, @Param('sessionId') sessionId: string) { return this.service.getPauseHistory(req.user.tenantId, sessionId); }

  @Get('stats')
  getStats(@Req() req: any, @Query('from') from?: string, @Query('to') to?: string) {
    return this.service.getPauseStats(req.user.tenantId, from ? new Date(from) : undefined, to ? new Date(to) : undefined);
  }
}
