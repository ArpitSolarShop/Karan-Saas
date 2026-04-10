import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { ApprovalsService } from './approvals.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';

@Controller('approvals')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: any) { 
    return this.approvalsService.create(req.user.tenantId, dto); 
  }

  @Get()
  findAll(@Req() req: any) { 
    return this.approvalsService.findAll(req.user.tenantId); 
  }

  @Get('pending/:approverId')
  findPending(@Req() req: any, @Param('approverId') approverId: string) { 
    return this.approvalsService.findPending(approverId, req.user.tenantId); 
  }

  @Patch(':id/approve')
  approve(@Req() req: any, @Param('id') id: string, @Body('comments') comments?: string) { 
    return this.approvalsService.approve(id, req.user.tenantId, comments); 
  }

  @Patch(':id/reject')
  reject(@Req() req: any, @Param('id') id: string, @Body('comments') comments?: string) { 
    return this.approvalsService.reject(id, req.user.tenantId, comments); 
  }
}
