import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { CannedResponseService } from '../services/canned-response.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { TenantGuard } from "../../auth/tenant.guard";

@Controller('agent-management/canned-responses')
@UseGuards(JwtAuthGuard, TenantGuard)
export class CannedResponseController {
  constructor(private readonly service: CannedResponseService) {}

  @Post()
  create(@Req() req: any, @Body() body: any) { return this.service.create(req.user.tenantId, body); }

  @Get()
  findAll(@Req() req: any, @Query('category') category?: string) {
    return this.service.findAll(req.user.tenantId, category);
  }

  @Get('search')
  search(@Req() req: any, @Query('q') query: string) {
    return this.service.search(req.user.tenantId, query);
  }

  @Get('categories')
  getCategories(@Req() req: any) { return this.service.getCategories(req.user.tenantId); }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) { return this.service.findOne(req.user.tenantId, id); }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() body: any) { return this.service.update(req.user.tenantId, id, body); }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) { return this.service.remove(req.user.tenantId, id); }
}
