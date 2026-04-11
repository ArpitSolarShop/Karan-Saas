import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AgentScriptsService } from '../services/agent-scripts.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { TenantGuard } from "../../auth/tenant.guard";

@Controller('campaigns/scripts')
@UseGuards(JwtAuthGuard, TenantGuard)
export class AgentScriptsController {
  constructor(private readonly service: AgentScriptsService) {}

  @Post()
  create(@Req() req: any, @Body() body: any) { return this.service.create(req.user.tenantId, body); }

  @Get()
  findAll(@Req() req: any) { return this.service.findAll(req.user.tenantId); }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) { return this.service.findOne(req.user.tenantId, id); }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() body: any) { return this.service.update(req.user.tenantId, id, body); }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) { return this.service.remove(req.user.tenantId, id); }

  @Post(':id/duplicate')
  duplicate(@Req() req: any, @Param('id') id: string) { return this.service.duplicate(req.user.tenantId, id); }
}
