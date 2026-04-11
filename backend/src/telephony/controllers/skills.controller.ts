import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { SkillsService } from '../services/skills.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { TenantGuard } from "../../auth/tenant.guard";

@Controller('telephony/skills')
@UseGuards(JwtAuthGuard, TenantGuard)
export class SkillsController {
  constructor(private readonly service: SkillsService) {}

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

  @Post('assign')
  assignToAgent(@Req() req: any, @Body() body: { agentId: string; skillId: string; level?: number }) {
    return this.service.assignToAgent(req.user.tenantId, body.agentId, body.skillId, body.level);
  }

  @Delete('agent/:agentId/skill/:skillId')
  removeFromAgent(@Req() req: any, @Param('agentId') agentId: string, @Param('skillId') skillId: string) {
    return this.service.removeFromAgent(req.user.tenantId, agentId, skillId);
  }

  @Get('agent/:agentId')
  getAgentSkills(@Req() req: any, @Param('agentId') agentId: string) {
    return this.service.getAgentSkills(req.user.tenantId, agentId);
  }

  @Post('rules')
  createRule(@Req() req: any, @Body() body: any) { return this.service.createRule(req.user.tenantId, body); }

  @Delete('rules/:id')
  deleteRule(@Req() req: any, @Param('id') id: string) { return this.service.deleteRule(req.user.tenantId, id); }
}
