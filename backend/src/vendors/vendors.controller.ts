import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';

@Controller('vendors')
@UseGuards(JwtAuthGuard, TenantGuard)
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  async create(@Body() dto: any, @Req() req: any) { 
    return this.vendorsService.create({ ...dto, tenantId: req.user.tenantId }); 
  }

  @Get()
  async findAll(@Req() req: any) { 
    return this.vendorsService.findAll(req.user.tenantId); 
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) { 
    return this.vendorsService.findOne(id, req.user.tenantId); 
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: any, @Req() req: any) { 
    return this.vendorsService.update(id, req.user.tenantId, dto); 
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) { 
    return this.vendorsService.remove(id, req.user.tenantId); 
  }
}
