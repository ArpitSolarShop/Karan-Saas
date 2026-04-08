import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { DialerEngineService } from '../services/dialer-engine.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('campaigns/dialer')
@UseGuards(JwtAuthGuard)
export class DialerEngineController {
  constructor(private readonly service: DialerEngineService) {}

  @Get(':campaignId/config')
  getConfig(@Param('campaignId') id: string) { return this.service.getDialerConfig(id); }

  @Post(':campaignId/config')
  upsertConfig(@Param('campaignId') id: string, @Body() body: any) {
    return this.service.upsertDialerConfig(id, body.tenantId, body);
  }

  @Post(':campaignId/start')
  start(@Param('campaignId') id: string) { return this.service.startDialer(id); }

  @Post(':campaignId/pause')
  pause(@Param('campaignId') id: string) { return this.service.pauseDialer(id); }

  @Post(':campaignId/stop')
  stop(@Param('campaignId') id: string) { return this.service.stopDialer(id); }

  @Get(':campaignId/progress')
  getProgress(@Param('campaignId') id: string) { return this.service.getCampaignProgress(id); }
}
