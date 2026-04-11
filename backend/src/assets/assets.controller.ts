import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: any) { return this.assetsService.create(req.user.tenantId, dto); }

  @Get()
  findAll(@Req() req: any) { return this.assetsService.findAll(req.user.tenantId); }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) { return this.assetsService.findOne(req.user.tenantId, id); }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: any) { return this.assetsService.update(req.user.tenantId, id, dto); }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) { return this.assetsService.remove(req.user.tenantId, id); }

  @Post(':id/reserve')
  reserve(@Req() req: any, @Param('id') id: string, @Body() dto: any) { return this.assetsService.reserve(req.user.tenantId, req.user.id, id, dto); }

  @Get(':id/reservations')
  getReservations(@Req() req: any, @Param('id') id: string) { return this.assetsService.getReservations(req.user.tenantId, id); }

  @Patch('reservations/:rid/cancel')
  cancelReservation(@Req() req: any, @Param('rid') rid: string) { return this.assetsService.cancelReservation(req.user.tenantId, rid); }
}
