import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { SipTrunksService } from '../services/sip-trunks.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('telephony/trunks')
@UseGuards(JwtAuthGuard)
export class SipTrunksController {
  constructor(private readonly service: SipTrunksService) {}

  @Post()
  create(@Body() body: any) { return this.service.create(body); }

  @Get()
  findAll(@Query('tenantId') tenantId: string) { return this.service.findAll(tenantId); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) { return this.service.update(id, body); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }

  // Outbound Routes
  @Post('routes')
  createRoute(@Body() body: any) { return this.service.createRoute(body); }

  @Get('routes/all')
  findAllRoutes(@Query('tenantId') tenantId: string) { return this.service.findAllRoutes(tenantId); }

  @Delete('routes/:id')
  deleteRoute(@Param('id') id: string) { return this.service.deleteRoute(id); }
}
