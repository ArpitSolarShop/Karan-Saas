import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { WallboardService } from '../services/wallboard.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { TenantGuard } from "../../auth/tenant.guard";

@Controller('agent-management/wallboard')
@UseGuards(JwtAuthGuard, TenantGuard)
export class WallboardController {
  constructor(private readonly service: WallboardService) {}

  @Get('live')
  getLiveData(@Req() req: any) { return this.service.getLiveData(req.user.tenantId); }

  @Get('configs')
  getConfigs(@Req() req: any) { return this.service.getConfigs(req.user.tenantId); }

  @Post('configs')
  createConfig(@Req() req: any, @Body() body: any) { return this.service.createConfig(req.user.tenantId, body); }

  @Patch('configs/:id')
  updateConfig(@Req() req: any, @Param('id') id: string, @Body() body: any) { return this.service.updateConfig(req.user.tenantId, id, body); }

  @Delete('configs/:id')
  deleteConfig(@Req() req: any, @Param('id') id: string) { return this.service.deleteConfig(req.user.tenantId, id); }
}
