import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { SipTrunksService } from '../services/sip-trunks.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { TenantGuard } from "../../auth/tenant.guard";

@Controller('telephony/trunks')
@UseGuards(JwtAuthGuard, TenantGuard)
export class SipTrunksController {
  constructor(private readonly service: SipTrunksService) {}

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

  // Outbound Routes
  @Post('routes')
  createRoute(@Req() req: any, @Body() body: any) { return this.service.createRoute(req.user.tenantId, body); }

  @Get('routes/all')
  findAllRoutes(@Req() req: any) { return this.service.findAllRoutes(req.user.tenantId); }

  @Delete('routes/:id')
  deleteRoute(@Req() req: any, @Param('id') id: string) { return this.service.deleteRoute(req.user.tenantId, id); }
}
