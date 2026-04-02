import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DealsService } from './deals.service';

@Controller('deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Post()
  create(@Body() dto: any) { return this.dealsService.create(dto); }

  @Get()
  findAll(@Query('tenantId') tenantId?: string) { return this.dealsService.findAll(tenantId); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.dealsService.findOne(id); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any) { return this.dealsService.update(id, dto); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.dealsService.remove(id); }
}
