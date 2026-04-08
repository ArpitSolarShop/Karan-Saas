import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { SkillsService } from '../services/skills.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('telephony/skills')
@UseGuards(JwtAuthGuard)
export class SkillsController {
  constructor(private readonly service: SkillsService) {}

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

  @Post('assign')
  assignToAgent(@Body() body: { agentId: string; skillId: string; level?: number }) {
    return this.service.assignToAgent(body.agentId, body.skillId, body.level);
  }

  @Delete('agent/:agentId/skill/:skillId')
  removeFromAgent(@Param('agentId') agentId: string, @Param('skillId') skillId: string) {
    return this.service.removeFromAgent(agentId, skillId);
  }

  @Get('agent/:agentId')
  getAgentSkills(@Param('agentId') agentId: string) {
    return this.service.getAgentSkills(agentId);
  }

  @Post('rules')
  createRule(@Body() body: any) { return this.service.createRule(body); }

  @Delete('rules/:id')
  deleteRule(@Param('id') id: string) { return this.service.deleteRule(id); }
}
