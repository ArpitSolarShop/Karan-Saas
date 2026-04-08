import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { TransmissionService } from '../services/transmission.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('campaigns/transmissions')
@UseGuards(JwtAuthGuard)
export class TransmissionController {
  constructor(private readonly service: TransmissionService) {}

  @Post()
  create(@Body() body: any) { return this.service.create(body); }

  @Get(':campaignId')
  findByCampaign(@Param('campaignId') id: string, @Query('status') status?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.findByCampaign(id, status, page ? parseInt(page) : 1, limit ? parseInt(limit) : 50);
  }

  @Get(':campaignId/stats')
  getStats(@Param('campaignId') id: string) { return this.service.getTransmissionStats(id); }

  @Post('spool')
  createSpool(@Body() body: any) { return this.service.createSpool(body); }

  @Patch('spool/:id/status')
  updateSpoolStatus(@Param('id') id: string, @Body() body: { status: any; [key: string]: any }) {
    const { status, ...extra } = body;
    return this.service.updateSpoolStatus(id, status, extra);
  }

  @Post('spool/:id/result')
  addResult(@Param('id') id: string, @Body() body: any) { return this.service.addSpoolResult(id, body); }
}
