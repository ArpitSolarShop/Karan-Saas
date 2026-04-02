import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { VendorsService } from './vendors.service';

@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  create(@Body() dto: any) { return this.vendorsService.create(dto); }

  @Get()
  findAll(@Query('tenantId') tenantId: string) { return this.vendorsService.findAll(tenantId); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.vendorsService.findOne(id); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any) { return this.vendorsService.update(id, dto); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.vendorsService.remove(id); }
}
