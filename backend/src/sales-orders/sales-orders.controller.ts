import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SalesOrdersService } from './sales-orders.service';

@Controller('sales-orders')
export class SalesOrdersController {
  constructor(private readonly salesOrdersService: SalesOrdersService) {}

  @Post()
  create(@Body() dto: any) { return this.salesOrdersService.create(dto); }

  @Get()
  findAll(@Query('tenantId') tenantId: string) { return this.salesOrdersService.findAll(tenantId); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.salesOrdersService.findOne(id); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any) { return this.salesOrdersService.update(id, dto); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.salesOrdersService.remove(id); }
}
