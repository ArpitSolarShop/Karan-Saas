import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ActivitiesService } from './activities.service';

@UseGuards(JwtAuthGuard)
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  log(@Body() body: { leadId: string; userId: string; type: string; description: string }) {
    return this.activitiesService.log(body.leadId, body.userId, body.type, body.description);
  }

  @Get('lead/:leadId')
  findByLead(@Param('leadId') leadId: string) {
    return this.activitiesService.findByLead(leadId);
  }

  @Get()
  findAll(@Query('tenantId') tenantId?: string) {
    return this.activitiesService.findAll(tenantId);
  }
}

