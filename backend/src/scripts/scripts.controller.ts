import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';
import { ScriptsService } from './scripts.service';

@UseGuards(JwtAuthGuard)
@UseGuards(JwtAuthGuard, TenantGuard)
export class ScriptsController {
  constructor(private readonly scriptsService: ScriptsService) {}

  @Get()
  async findAll(@Req() req: any) {
    return this.scriptsService.findAll(req.user.tenantId);
  }

  @Get('campaign/:campaignId')
  findByCampaign(@Param('campaignId') campaignId: string) {
    return this.scriptsService.findByCampaign(campaignId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scriptsService.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.scriptsService.create(body);
  }
}
