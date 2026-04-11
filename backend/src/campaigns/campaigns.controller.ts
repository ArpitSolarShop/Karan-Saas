import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
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
  async findAll(@Req() req: any) {
    return this.service.findAll(req.user.tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.service.findOne(id, req.user.tenantId);
  }

  @Post()
  async create(@Body() body: any, @Req() req: any) {
    return this.service.create(req.user.tenantId, { ...body });
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.service.update(id, req.user.tenantId, body);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: { status: string }, @Req() req: any) {
    return this.service.updateStatus(id, req.user.tenantId, body.status);
  }

  @Post(':id/agents')
  async assignAgent(
    @Param('id') id: string,
    @Body() body: { agentId: string; dailyTarget?: number },
    @Req() req: any,
  ) {
    return this.service.assignAgent(id, req.user.tenantId, body.agentId, body.dailyTarget);
  }

  @Delete(':id/agents/:agentId')
  async removeAgent(@Param('id') id: string, @Param('agentId') agentId: string, @Req() req: any) {
    return this.service.removeAgent(id, req.user.tenantId, agentId);
  }

  @Get(':id/stats')
  async getStats(@Param('id') id: string, @Req() req: any) {
    return this.service.getStats(id, req.user.tenantId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.service.remove(id, req.user.tenantId);
  }

  // ── Dialer Control ──────────────────────────────────────────────────────────

  /**
   * POST /campaigns/dialer/:id/start
   * Begins the auto-dialer for this campaign (schedules BullMQ repeating job).
   */
  @Post('dialer/:id/start')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER', 'SUPERVISOR')
  async startDialer(@Param('id') id: string, @Req() req: any) {
    await this.service.updateStatus(id, req.user.tenantId, 'ACTIVE');
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
  async pauseDialer(@Param('id') id: string, @Req() req: any) {
    await this.service.updateStatus(id, req.user.tenantId, 'PAUSED');
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
  async stopDialer(@Param('id') id: string, @Req() req: any) {
    await this.service.updateStatus(id, req.user.tenantId, 'COMPLETED');
    await this.queueService.stopCampaignDialer(id);
    return { stopped: true, campaignId: id };
  }

  @Get('dialer/:id/progress')
  async getDialerProgress(@Param('id') id: string, @Req() req: any) {
    return this.service.getDialerProgress(id, req.user.tenantId);
  }

  @Get('dialer/:id/config')
  async getDialerConfig(@Param('id') id: string, @Req() req: any) {
    const campaign: any = await this.service.findOne(id, req.user.tenantId);
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
  async clone(@Param('id') id: string, @Req() req: any) {
    return this.service.clone(id, req.user.tenantId);
  }

  /** GET /campaigns/import-history — all lead list imports */
  @Get('import-history')
  async importHistory(@Req() req: any) {
    return this.service.importHistory(req.user.tenantId);
  }

  /** GET /campaigns/:id/import-history — imports for specific campaign */
  @Get(':id/import-history')
  async campaignImportHistory(@Param('id') id: string, @Req() req: any) {
    return this.service.importHistory(req.user.tenantId, id);
  }
}
