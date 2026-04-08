import { UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';
import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ActivitiesService } from './activities.service';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  log(
    @Body()
    body: {
      leadId: string;
      userId: string;
      type: string;
      description: string;
    },
    @Req() req: any,
  ) {
    return this.activitiesService.log(
      req.tenantId || req.user.tenantId,
      body.leadId,
      body.userId,
      body.type,
      body.description,
    );
  }

  @Get('lead/:leadId')
  findByLead(@Param('leadId') leadId: string, @Req() req: any) {
    return this.activitiesService.findByLead(leadId, req.tenantId || req.user.tenantId);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.activitiesService.findAll(req.tenantId || req.user.tenantId);
  }
}
