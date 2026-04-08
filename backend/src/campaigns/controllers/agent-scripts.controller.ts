import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AgentScriptsService } from '../services/agent-scripts.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('campaigns/scripts')
@UseGuards(JwtAuthGuard)
export class AgentScriptsController {
  constructor(private readonly service: AgentScriptsService) {}

  @Post()
  create(@Body() body: any) { return this.service.create(body); }

  @Get()
  findAll(@Query('tenantId') tenantId: string) { return this.service.findAll(tenantId); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) { return this.service.update(id, body); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }

  @Post(':id/duplicate')
  duplicate(@Param('id') id: string) { return this.service.duplicate(id); }
}
