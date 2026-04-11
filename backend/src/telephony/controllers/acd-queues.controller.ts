import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AcdQueuesService } from '../services/acd-queues.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { TenantGuard } from "../../auth/tenant.guard";

@Controller('telephony/queues')
@UseGuards(JwtAuthGuard, TenantGuard)
export class AcdQueuesController {
  constructor(private readonly service: AcdQueuesService) {}

  @Post()
  create(@Req() req: any, @Body() body: any) { return this.service.create(req.user.tenantId, body); }

  @Get()
  findAll(@Req() req: any) { return this.service.findAll(req.user.tenantId); }

  @Get('stats')
  getStats(@Req() req: any) { return this.service.getStats(req.user.tenantId); }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) { return this.service.findOne(req.user.tenantId, id); }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() body: any) { return this.service.update(req.user.tenantId, id, body); }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) { return this.service.remove(req.user.tenantId, id); }

  @Post(':id/members')
  addMember(@Req() req: any, @Param('id') id: string, @Body() body: { extensionId: string; penalty?: number }) {
    return this.service.addMember(req.user.tenantId, id, body.extensionId, body.penalty);
  }

  @Delete(':id/members/:extensionId')
  removeMember(@Req() req: any, @Param('id') id: string, @Param('extensionId') extId: string) {
    return this.service.removeMember(req.user.tenantId, id, extId);
  }

  @Patch(':id/members/:extensionId/pause')
  togglePause(@Req() req: any, @Param('id') id: string, @Param('extensionId') extId: string, @Body() body: { paused: boolean }) {
    return this.service.toggleMemberPause(req.user.tenantId, id, extId, body.paused);
  }

  @Post(':id/skills')
  addSkill(@Req() req: any, @Param('id') id: string, @Body() body: { skillId: string }) {
    return this.service.addSkill(req.user.tenantId, id, body.skillId);
  }

  @Delete(':id/skills/:skillId')
  removeSkill(@Req() req: any, @Param('id') id: string, @Param('skillId') skillId: string) {
    return this.service.removeSkill(req.user.tenantId, id, skillId);
  }
}
