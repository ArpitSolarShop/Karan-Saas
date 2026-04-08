import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AgentPauseService } from '../services/agent-pause.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('agent-management/pauses')
@UseGuards(JwtAuthGuard)
export class AgentPauseController {
  constructor(private readonly service: AgentPauseService) {}

  // Pause Codes
  @Post('codes')
  createCode(@Body() body: any) { return this.service.createPauseCode(body); }

  @Get('codes')
  findAllCodes(@Query('tenantId') tenantId: string) { return this.service.findAllPauseCodes(tenantId); }

  @Patch('codes/:id')
  updateCode(@Param('id') id: string, @Body() body: any) { return this.service.updatePauseCode(id, body); }

  @Delete('codes/:id')
  deleteCode(@Param('id') id: string) { return this.service.deletePauseCode(id); }

  // Agent pauses
  @Post('start')
  startPause(@Body() body: { sessionId: string; pauseCodeId: string; tenantId: string; notes?: string }) {
    return this.service.startPause(body.sessionId, body.pauseCodeId, body.tenantId, body.notes);
  }

  @Post(':id/end')
  endPause(@Param('id') id: string) { return this.service.endPause(id); }

  @Get('active/:sessionId')
  getActive(@Param('sessionId') sessionId: string) { return this.service.getActivePause(sessionId); }

  @Get('history/:sessionId')
  getHistory(@Param('sessionId') sessionId: string) { return this.service.getPauseHistory(sessionId); }

  @Get('stats')
  getStats(@Query('tenantId') tenantId: string, @Query('from') from?: string, @Query('to') to?: string) {
    return this.service.getPauseStats(tenantId, from ? new Date(from) : undefined, to ? new Date(to) : undefined);
  }
}
