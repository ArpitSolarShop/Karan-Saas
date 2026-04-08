import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { QueueService } from '../queue/queue.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { TenantGuard } from '../auth/tenant.guard';

@Controller('campaigns')
@UseGuards(JwtAuthGuard, TenantGuard)
export class CampaignsController {
  constructor(
    private service: CampaignsService,
    private queueService: QueueService,
  ) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.service.updateStatus(id, body.status);
  }

  @Post(':id/agents')
  assignAgent(
    @Param('id') id: string,
    @Body() body: { agentId: string; dailyTarget?: number },
  ) {
    return this.service.assignAgent(id, body.agentId, body.dailyTarget);
  }

  @Delete(':id/agents/:agentId')
  removeAgent(@Param('id') id: string, @Param('agentId') agentId: string) {
    return this.service.removeAgent(id, agentId);
  }

  @Get(':id/stats')
  getStats(@Param('id') id: string) {
    return this.service.getStats(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  // ── Dialer Control ──────────────────────────────────────────────────────────

  /**
   * POST /campaigns/dialer/:id/start
   * Begins the auto-dialer for this campaign (schedules BullMQ repeating job).
   */
  @Post('dialer/:id/start')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER', 'SUPERVISOR')
  async startDialer(@Param('id') id: string) {
    await this.service.updateStatus(id, 'ACTIVE');
    await this.queueService.scheduleCampaignDialer(id, 5_000); // tick every 5s
    return { started: true, campaignId: id };
  }

  /**
   * POST /campaigns/dialer/:id/pause
   * Pauses the auto-dialer (stops repeating job, keeps status).
   */
  @Post('dialer/:id/pause')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER', 'SUPERVISOR')
  async pauseDialer(@Param('id') id: string) {
    await this.service.updateStatus(id, 'PAUSED');
    await this.queueService.stopCampaignDialer(id);
    return { paused: true, campaignId: id };
  }

  /**
   * POST /campaigns/dialer/:id/stop
   * Stops the auto-dialer completely and marks campaign completed.
   */
  @Post('dialer/:id/stop')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER', 'SUPERVISOR')
  async stopDialer(@Param('id') id: string) {
    await this.service.updateStatus(id, 'COMPLETED');
    await this.queueService.stopCampaignDialer(id);
    return { stopped: true, campaignId: id };
  }

  @Get('dialer/:id/progress')
  async getDialerProgress(@Param('id') id: string) {
    return this.service.getDialerProgress(id);
  }

  @Get('dialer/:id/config')
  async getDialerConfig(@Param('id') id: string) {
    const campaign: any = await this.service.findOne(id);
    const config = campaign?.dialerConfig || {};
    return {
      mode: config.mode || 'PREDICTIVE',
      callsPerAgent: config.callsPerAgent || 1.2,
      dropRateLimit: config.dropRateLimit || 3,
      amdEnabled: config.amdEnabled ?? true,
      maxRetries: config.maxRetries || 3,
      paceAlgorithm: config.paceAlgorithm || 'ADAPTIVE'
    };
  }

  // ── Clone & Import History ────────────────────────────────────────────────

  /** POST /campaigns/:id/clone — create a DRAFT copy of this campaign */
  @Post(':id/clone')
  clone(@Param('id') id: string) {
    return this.service.clone(id);
  }

  /** GET /campaigns/import-history — all lead list imports */
  @Get('import-history')
  importHistory() {
    return this.service.importHistory();
  }

  /** GET /campaigns/:id/import-history — imports for specific campaign */
  @Get(':id/import-history')
  campaignImportHistory(@Param('id') id: string) {
    return this.service.importHistory(id);
  }
}
