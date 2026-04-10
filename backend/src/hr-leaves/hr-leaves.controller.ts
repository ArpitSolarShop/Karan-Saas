import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { HrLeavesService } from './hr-leaves.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';

@Controller('hr-leaves')
@UseGuards(JwtAuthGuard, TenantGuard)
export class HrLeavesController {
  constructor(private readonly hrLeavesService: HrLeavesService) {}

  @Post()
  create(@Req() req: any, @Body() dto: any) { 
    return this.hrLeavesService.create(req.user.tenantId, dto); 
  }

  @Get()
  findAll(@Req() req: any) { 
    return this.hrLeavesService.findAll(req.user.tenantId); 
  }

  @Get('user/:userId')
  findByUser(@Req() req: any, @Param('userId') userId: string) { 
    return this.hrLeavesService.findByUser(userId, req.user.tenantId); 
  }

  @Patch(':id/approve')
  approve(@Req() req: any, @Param('id') id: string) { 
    return this.hrLeavesService.approve(id, req.user.tenantId); 
  }

  @Patch(':id/reject')
  reject(@Req() req: any, @Param('id') id: string, @Body('reason') reason?: string) { 
    return this.hrLeavesService.reject(id, req.user.tenantId, reason); 
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) { 
    return this.hrLeavesService.remove(id, req.user.tenantId); 
  }
}
