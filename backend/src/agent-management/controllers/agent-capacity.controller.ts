import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AgentCapacityService } from '../services/agent-capacity.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('agent-management/capacity')
@UseGuards(JwtAuthGuard)
export class AgentCapacityController {
  constructor(private readonly service: AgentCapacityService) {}

  @Get(':agentId')
  get(@Param('agentId') agentId: string) { return this.service.getCapacity(agentId); }

  @Post(':agentId')
  upsert(@Param('agentId') agentId: string, @Body() body: any) { return this.service.upsertCapacity(agentId, body.tenantId, body); }

  @Get()
  getAll(@Query('tenantId') tenantId: string) { return this.service.getAllCapacities(tenantId); }

  @Delete(':agentId')
  remove(@Param('agentId') agentId: string) { return this.service.remove(agentId); }
}
