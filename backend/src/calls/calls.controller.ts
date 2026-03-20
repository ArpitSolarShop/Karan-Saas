import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { CallsService } from './calls.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class CallsController {
  constructor(private service: CallsService) {}

  // â”€â”€ Calls â”€â”€
  @Get('calls')
  findAll(@Query('agentId') agentId?: string, @Query('leadId') leadId?: string, @Query('campaignId') campaignId?: string) {
    return this.service.findAll({ agentId, leadId, campaignId });
  }

  @Get('calls/:id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post('calls')
  create(@Body() body: any) { return this.service.create(body); }

  @Post('calls/:id/disposition')
  setDisposition(@Param('id') id: string, @Body() body: { dispositionId: string; notes?: string }) {
    return this.service.setDisposition(id, body);
  }

  @Post('calls/:id/end')
  endCall(@Param('id') id: string, @Body() body: { durationSeconds: number; talkTimeSeconds?: number; recordingUrl?: string }) {
    return this.service.endCall(id, body);
  }

  // â”€â”€ Dispositions â”€â”€
  @Get('dispositions')
  findAllDispositions() { return this.service.findAllDispositions(); }

  @Post('dispositions')
  createDisposition(@Body() body: any) { return this.service.createDisposition(body); }

  // â”€â”€ Callbacks â”€â”€
  @Get('callbacks/due')
  findCallbacksDue() { return this.service.findCallbacksDue(); }

  @Post('callbacks')
  createCallback(@Body() body: any) { return this.service.createCallback(body); }

  // â”€â”€ Agent Stats â”€â”€
  @Get('agents/:id/stats')
  getAgentStats(@Param('id') id: string, @Query('date') date?: string) {
    return this.service.getAgentStats(id, date);
  }
}

