import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AcdQueuesService } from '../services/acd-queues.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('telephony/queues')
@UseGuards(JwtAuthGuard)
export class AcdQueuesController {
  constructor(private readonly service: AcdQueuesService) {}

  @Post()
  create(@Body() body: any) { return this.service.create(body); }

  @Get()
  findAll(@Query('tenantId') tenantId: string) { return this.service.findAll(tenantId); }

  @Get('stats')
  getStats(@Query('tenantId') tenantId: string) { return this.service.getStats(tenantId); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) { return this.service.update(id, body); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }

  @Post(':id/members')
  addMember(@Param('id') id: string, @Body() body: { extensionId: string; penalty?: number }) {
    return this.service.addMember(id, body.extensionId, body.penalty);
  }

  @Delete(':id/members/:extensionId')
  removeMember(@Param('id') id: string, @Param('extensionId') extId: string) {
    return this.service.removeMember(id, extId);
  }

  @Patch(':id/members/:extensionId/pause')
  togglePause(@Param('id') id: string, @Param('extensionId') extId: string, @Body() body: { paused: boolean }) {
    return this.service.toggleMemberPause(id, extId, body.paused);
  }

  @Post(':id/skills')
  addSkill(@Param('id') id: string, @Body() body: { skillId: string }) {
    return this.service.addSkill(id, body.skillId);
  }

  @Delete(':id/skills/:skillId')
  removeSkill(@Param('id') id: string, @Param('skillId') skillId: string) {
    return this.service.removeSkill(id, skillId);
  }
}
