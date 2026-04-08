import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { WallboardService } from '../services/wallboard.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('agent-management/wallboard')
@UseGuards(JwtAuthGuard)
export class WallboardController {
  constructor(private readonly service: WallboardService) {}

  @Get('live')
  getLiveData(@Query('tenantId') tenantId: string) { return this.service.getLiveData(tenantId); }

  @Get('configs')
  getConfigs(@Query('tenantId') tenantId: string) { return this.service.getConfigs(tenantId); }

  @Post('configs')
  createConfig(@Body() body: any) { return this.service.createConfig(body); }

  @Patch('configs/:id')
  updateConfig(@Param('id') id: string, @Body() body: any) { return this.service.updateConfig(id, body); }

  @Delete('configs/:id')
  deleteConfig(@Param('id') id: string) { return this.service.deleteConfig(id); }
}
