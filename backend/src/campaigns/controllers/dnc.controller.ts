import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { DncService } from '../services/dnc.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { TenantGuard } from "../../auth/tenant.guard";

@Controller('campaigns/dnc')
@UseGuards(JwtAuthGuard, TenantGuard)
export class DncController {
  constructor(private readonly service: DncService) {}

  @Post()
  addEntry(@Req() req: any, @Body() body: any) { return this.service.addEntry(req.user.tenantId, body); }

  @Post('bulk')
  addBulk(@Req() req: any, @Body() body: { entries: { phone: string; reason?: string }[]; addedBy?: string }) {
    return this.service.addBulk(body.entries, req.user.tenantId, body.addedBy);
  }

  @Get('check/:phone')
  checkPhone(@Req() req: any, @Param('phone') phone: string) {
    return this.service.checkPhone(phone, req.user.tenantId);
  }

  @Post('check-bulk')
  checkPhones(@Req() req: any, @Body() body: { phones: string[] }) {
    return this.service.checkPhones(body.phones, req.user.tenantId);
  }

  @Get()
  findAll(@Req() req: any, @Query('page') page?: string, @Query('limit') limit?: string, @Query('search') search?: string) {
    return this.service.findAll(req.user.tenantId, page ? parseInt(page) : 1, limit ? parseInt(limit) : 50, search);
  }

  @Get('stats')
  getStats(@Req() req: any) { return this.service.getStats(req.user.tenantId); }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) { return this.service.remove(req.user.tenantId, id); }
}
