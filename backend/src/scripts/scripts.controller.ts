import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ScriptsService } from './scripts.service';

@UseGuards(JwtAuthGuard)
@Controller('scripts')
export class ScriptsController {
  constructor(private readonly scriptsService: ScriptsService) {}

  @Get()
  findAll(@Query('tenantId') tenantId: string) {
    return this.scriptsService.findAll(tenantId || 'dev-tenant-001');
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

