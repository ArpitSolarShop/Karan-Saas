import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { DealsService } from './deals.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: any) { return this.dealsService.create(req.user.tenantId, dto, req.user.id); }

  @Get()
  findAll(@Req() req: any) { return this.dealsService.findAll(req.user.tenantId); }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) { return this.dealsService.findOne(req.user.tenantId, id); }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: any) { return this.dealsService.update(req.user.tenantId, id, dto, req.user.id); }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) { return this.dealsService.remove(req.user.tenantId, id); }
}
