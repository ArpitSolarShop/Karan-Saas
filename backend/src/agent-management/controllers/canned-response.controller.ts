import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { CannedResponseService } from '../services/canned-response.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('agent-management/canned-responses')
@UseGuards(JwtAuthGuard)
export class CannedResponseController {
  constructor(private readonly service: CannedResponseService) {}

  @Post()
  create(@Body() body: any) { return this.service.create(body); }

  @Get()
  findAll(@Query('tenantId') tenantId: string, @Query('category') category?: string) {
    return this.service.findAll(tenantId, category);
  }

  @Get('search')
  search(@Query('tenantId') tenantId: string, @Query('q') query: string) {
    return this.service.search(tenantId, query);
  }

  @Get('categories')
  getCategories(@Query('tenantId') tenantId: string) { return this.service.getCategories(tenantId); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) { return this.service.update(id, body); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
