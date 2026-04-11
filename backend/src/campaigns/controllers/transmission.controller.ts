import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { TransmissionService } from '../services/transmission.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { TenantGuard } from "../../auth/tenant.guard";

@Controller('campaigns/transmissions')
@UseGuards(JwtAuthGuard, TenantGuard)
export class TransmissionController {
  constructor(private readonly service: TransmissionService) {}

  @Post()
  create(@Req() req: any, @Body() body: any) { return this.service.create(req.user.tenantId, body); }

  @Get(':campaignId')
  findByCampaign(@Req() req: any, @Param('campaignId') id: string, @Query('status') status?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.findByCampaign(req.user.tenantId, id, status, page ? parseInt(page) : 1, limit ? parseInt(limit) : 50);
  }

  @Get(':campaignId/stats')
  getStats(@Req() req: any, @Param('campaignId') id: string) { return this.service.getTransmissionStats(req.user.tenantId, id); }

  @Post('spool')
  createSpool(@Req() req: any, @Body() body: any) { return this.service.createSpool(req.user.tenantId, body); }

  @Patch('spool/:id/status')
  updateSpoolStatus(@Req() req: any, @Param('id') id: string, @Body() body: { status: any; [key: string]: any }) {
    const { status, ...extra } = body;
    return this.service.updateSpoolStatus(req.user.tenantId, id, status, extra);
  }

  @Post('spool/:id/result')
  addResult(@Req() req: any, @Param('id') id: string, @Body() body: any) { return this.service.addSpoolResult(req.user.tenantId, id, body); }
}
