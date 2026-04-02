import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import { ApprovalsService } from './approvals.service';

@Controller('approvals')
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Post()
  create(@Body() dto: any) { return this.approvalsService.create(dto); }

  @Get()
  findAll(@Query('tenantId') tenantId: string) { return this.approvalsService.findAll(tenantId); }

  @Get('pending/:approverId')
  findPending(@Param('approverId') approverId: string) { return this.approvalsService.findPending(approverId); }

  @Patch(':id/approve')
  approve(@Param('id') id: string, @Body('comments') comments?: string) { return this.approvalsService.approve(id, comments); }

  @Patch(':id/reject')
  reject(@Param('id') id: string, @Body('comments') comments?: string) { return this.approvalsService.reject(id, comments); }
}
