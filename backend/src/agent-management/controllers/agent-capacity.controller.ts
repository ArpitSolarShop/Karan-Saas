import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { AgentCapacityService } from '../services/agent-capacity.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { TenantGuard } from "../../auth/tenant.guard";

@Controller('agent-management/capacity')
@UseGuards(JwtAuthGuard, TenantGuard)
export class AgentCapacityController {
  constructor(private readonly service: AgentCapacityService) {}

  @Get(':agentId')
  get(@Req() req: any, @Param('agentId') agentId: string) { return this.service.getCapacity(req.user.tenantId, agentId); }

  @Post(':agentId')
  upsert(@Req() req: any, @Param('agentId') agentId: string, @Body() body: any) { return this.service.upsertCapacity(req.user.tenantId, agentId, body); }

  @Get()
  getAll(@Req() req: any) { return this.service.getAllCapacities(req.user.tenantId); }

  @Delete(':agentId')
  remove(@Req() req: any, @Param('agentId') agentId: string) { return this.service.remove(req.user.tenantId, agentId); }
}
