import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { DncService } from '../services/dnc.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('campaigns/dnc')
@UseGuards(JwtAuthGuard)
export class DncController {
  constructor(private readonly service: DncService) {}

  @Post()
  addEntry(@Body() body: any) { return this.service.addEntry(body); }

  @Post('bulk')
  addBulk(@Body() body: { entries: { phone: string; reason?: string }[]; tenantId: string; addedBy?: string }) {
    return this.service.addBulk(body.entries, body.tenantId, body.addedBy);
  }

  @Get('check/:phone')
  checkPhone(@Param('phone') phone: string, @Query('tenantId') tenantId: string) {
    return this.service.checkPhone(phone, tenantId);
  }

  @Post('check-bulk')
  checkPhones(@Body() body: { phones: string[]; tenantId: string }) {
    return this.service.checkPhones(body.phones, body.tenantId);
  }

  @Get()
  findAll(@Query('tenantId') tenantId: string, @Query('page') page?: string, @Query('limit') limit?: string, @Query('search') search?: string) {
    return this.service.findAll(tenantId, page ? parseInt(page) : 1, limit ? parseInt(limit) : 50, search);
  }

  @Get('stats')
  getStats(@Query('tenantId') tenantId: string) { return this.service.getStats(tenantId); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
