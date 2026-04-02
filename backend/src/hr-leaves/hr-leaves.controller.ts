import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { HrLeavesService } from './hr-leaves.service';

@Controller('hr-leaves')
export class HrLeavesController {
  constructor(private readonly hrLeavesService: HrLeavesService) {}

  @Post()
  create(@Body() dto: any) { return this.hrLeavesService.create(dto); }

  @Get()
  findAll(@Query('tenantId') tenantId: string) { return this.hrLeavesService.findAll(tenantId); }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) { return this.hrLeavesService.findByUser(userId); }

  @Patch(':id/approve')
  approve(@Param('id') id: string) { return this.hrLeavesService.approve(id); }

  @Patch(':id/reject')
  reject(@Param('id') id: string, @Body('reason') reason?: string) { return this.hrLeavesService.reject(id, reason); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.hrLeavesService.remove(id); }
}
