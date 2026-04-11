import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { RingGroupsService } from '../services/ring-groups.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { TenantGuard } from "../../auth/tenant.guard";

@Controller('telephony/ring-groups')
@UseGuards(JwtAuthGuard, TenantGuard)
export class RingGroupsController {
  constructor(private readonly service: RingGroupsService) {}

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

  @Post(':id/members')
  addMember(@Req() req: any, @Param('id') id: string, @Body() body: { extensionId: string }) {
    return this.service.addMember(req.user.tenantId, id, body.extensionId);
  }

  @Delete(':id/members/:extensionId')
  removeMember(@Req() req: any, @Param('id') id: string, @Param('extensionId') extId: string) {
    return this.service.removeMember(req.user.tenantId, id, extId);
  }
}
