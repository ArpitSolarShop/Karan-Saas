import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { DialerEngineService } from '../services/dialer-engine.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { TenantGuard } from "../../auth/tenant.guard";

@Controller('campaigns/dialer')
@UseGuards(JwtAuthGuard, TenantGuard)
export class DialerEngineController {
  constructor(private readonly service: DialerEngineService) {}

  @Get(':campaignId/config')
  getConfig(@Req() req: any, @Param('campaignId') id: string) { return this.service.getDialerConfig(req.user.tenantId, id); }

  upsertConfig(@Req() req: any, @Param('campaignId') id: string, @Body() body: any) {
    return this.service.upsertDialerConfig(req.user.tenantId, id, body);
  }

  @Post(':campaignId/start')
  start(@Req() req: any, @Param('campaignId') id: string) { return this.service.startDialer(req.user.tenantId, id); }

  @Post(':campaignId/pause')
  pause(@Req() req: any, @Param('campaignId') id: string) { return this.service.pauseDialer(req.user.tenantId, id); }

  @Post(':campaignId/stop')
  stop(@Req() req: any, @Param('campaignId') id: string) { return this.service.stopDialer(req.user.tenantId, id); }

  @Get(':campaignId/progress')
  getProgress(@Req() req: any, @Param('campaignId') id: string) { return this.service.getCampaignProgress(req.user.tenantId, id); }
}
