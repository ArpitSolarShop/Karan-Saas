import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { RingGroupsService } from '../services/ring-groups.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('telephony/ring-groups')
@UseGuards(JwtAuthGuard)
export class RingGroupsController {
  constructor(private readonly service: RingGroupsService) {}

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

  @Post(':id/members')
  addMember(@Param('id') id: string, @Body() body: { extensionId: string }) {
    return this.service.addMember(id, body.extensionId);
  }

  @Delete(':id/members/:extensionId')
  removeMember(@Param('id') id: string, @Param('extensionId') extId: string) {
    return this.service.removeMember(id, extId);
  }
}
