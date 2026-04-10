import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { BusinessHoursService } from './business-hours.service';
import { CreateBusinessHoursDto } from './dto/create-business-hours.dto';
import { UpdateBusinessHoursDto } from './dto/update-business-hours.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';

@Controller('business-hours')
@UseGuards(JwtAuthGuard, TenantGuard)
export class BusinessHoursController {
  constructor(private readonly businessHoursService: BusinessHoursService) {}

  @Post()
  create(@Req() req: any, @Body() createBusinessHoursDto: CreateBusinessHoursDto) {
    return this.businessHoursService.create(req.user.tenantId, createBusinessHoursDto);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.businessHoursService.findAll(req.user.tenantId);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.businessHoursService.findOne(id, req.user.tenantId);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() updateBusinessHoursDto: UpdateBusinessHoursDto) {
    return this.businessHoursService.update(id, req.user.tenantId, updateBusinessHoursDto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.businessHoursService.remove(id, req.user.tenantId);
  }
}
