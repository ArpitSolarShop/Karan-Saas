import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AssetsService } from './assets.service';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  create(@Body() dto: any) { return this.assetsService.create(dto); }

  @Get()
  findAll(@Query('tenantId') tenantId: string) { return this.assetsService.findAll(tenantId); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.assetsService.findOne(id); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any) { return this.assetsService.update(id, dto); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.assetsService.remove(id); }

  @Post(':id/reserve')
  reserve(@Param('id') id: string, @Body() dto: any) { return this.assetsService.reserve(id, dto); }

  @Get(':id/reservations')
  getReservations(@Param('id') id: string) { return this.assetsService.getReservations(id); }

  @Patch('reservations/:rid/cancel')
  cancelReservation(@Param('rid') rid: string) { return this.assetsService.cancelReservation(rid); }
}
