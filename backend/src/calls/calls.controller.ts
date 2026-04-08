import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';
import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { CallsService } from './calls.service';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller()
export class CallsController {
  constructor(private service: CallsService) {}

  // â”€â”€ Calls â”€â”€
  @Get('calls')
  findAll(
    @Req() req: any,
    @Query('agentId') agentId?: string,
    @Query('leadId') leadId?: string,
    @Query('campaignId') campaignId?: string,
  ) {
    return this.service.findAll(req.tenantId || req.user.tenantId, { agentId, leadId, campaignId });
  }

  @Get('calls/:id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post('calls')
  create(@Body() body: any, @Req() req: any) {
    return this.service.create({
      ...body,
      tenantId: req.tenantId || req.user.tenantId,
    }, req.user?.id);
  }

  @Post('calls/:id/disposition')
  setDisposition(
    @Param('id') id: string,
    @Body() body: { dispositionId: string; notes?: string },
    @Req() req: any,
  ) {
    return this.service.setDisposition(id, req.tenantId || req.user.tenantId, body, req.user?.id);
  }

  @Post('calls/:id/end')
  endCall(
    @Param('id') id: string,
    @Body()
    body: {
      durationSeconds: number;
      talkTimeSeconds?: number;
      recordingUrl?: string;
    },
    @Req() req: any,
  ) {
    return this.service.endCall(id, req.tenantId || req.user.tenantId, body, req.user?.id);
  }

  // â”€â”€ Dispositions â”€â”€
  @Get('dispositions')
  findAllDispositions(@Req() req: any) {
    return this.service.findAllDispositions(req.user.tenantId);
  }

  @Post('dispositions')
  createDisposition(@Body() body: any, @Req() req: any) {
    return this.service.createDisposition({ ...body, tenantId: req.user.tenantId });
  }

  // â”€â”€ Callbacks â”€â”€
  @Get('callbacks/due')
  findCallbacksDue(@Req() req: any) {
    return this.service.findCallbacksDue(req.user.tenantId);
  }

  @Post('callbacks')
  createCallback(@Body() body: any, @Req() req: any) {
    return this.service.createCallback({ ...body, tenantId: req.user.tenantId });
  }

  // â”€â”€ Agent Stats â”€â”€
  @Get('agents/:id/stats')
  getAgentStats(@Param('id') id: string, @Query('date') date?: string) {
    return this.service.getAgentStats(id, date);
  }
}
