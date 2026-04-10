import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { SalesOrdersService } from './sales-orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';

@Controller('sales-orders')
@UseGuards(JwtAuthGuard, TenantGuard)
export class SalesOrdersController {
  constructor(private readonly salesOrdersService: SalesOrdersService) {}

  @Post()
  async create(@Body() dto: any, @Req() req: any) { 
    return this.salesOrdersService.create({ ...dto, tenantId: req.user.tenantId }); 
  }

  @Get()
  async findAll(@Req() req: any) { 
    return this.salesOrdersService.findAll(req.user.tenantId); 
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) { 
    return this.salesOrdersService.findOne(id, req.user.tenantId); 
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: any, @Req() req: any) { 
    return this.salesOrdersService.update(id, req.user.tenantId, dto); 
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) { 
    return this.salesOrdersService.remove(id, req.user.tenantId); 
  }
}
