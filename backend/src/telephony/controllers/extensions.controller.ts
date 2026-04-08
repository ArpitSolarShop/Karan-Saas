import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ExtensionsService } from '../services/extensions.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('telephony/extensions')
@UseGuards(JwtAuthGuard)
export class ExtensionsController {
  constructor(private readonly service: ExtensionsService) {}

  @Post()
  create(@Body() body: any) { return this.service.create(body); }

  @Get()
  findAll(@Query('tenantId') tenantId: string) { return this.service.findAll(tenantId); }

  @Get('stats')
  getStats(@Query('tenantId') tenantId: string) { return this.service.getStats(tenantId); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) { return this.service.update(id, body); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
