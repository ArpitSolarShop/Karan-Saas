import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { CustomObjectsService } from './custom-objects.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('custom-objects')
export class CustomObjectsController {
  constructor(private readonly customObjectsService: CustomObjectsService) {}

  // ── Schemas ──
  @Post('schemas')
  createSchema(@Req() req: any, @Body() dto: any) { return this.customObjectsService.createSchema(req.user.tenantId, dto); }

  @Get('schemas')
  findAllSchemas(@Req() req: any) { return this.customObjectsService.findAllSchemas(req.user.tenantId); }

  @Get('schemas/:id')
  findOneSchema(@Req() req: any, @Param('id') id: string) { return this.customObjectsService.findOneSchema(req.user.tenantId, id); }

  @Patch('schemas/:id')
  updateSchema(@Req() req: any, @Param('id') id: string, @Body() dto: any) { return this.customObjectsService.updateSchema(req.user.tenantId, id, dto); }

  @Delete('schemas/:id')
  removeSchema(@Req() req: any, @Param('id') id: string) { return this.customObjectsService.removeSchema(req.user.tenantId, id); }

  // ── Records ──
  @Post('schemas/:schemaId/records')
  createRecord(@Req() req: any, @Param('schemaId') schemaId: string, @Body() dto: any) { return this.customObjectsService.createRecord(req.user.tenantId, schemaId, dto); }

  @Get('schemas/:schemaId/records')
  findAllRecords(@Req() req: any, @Param('schemaId') schemaId: string) { return this.customObjectsService.findAllRecords(req.user.tenantId, schemaId); }

  @Patch('records/:id')
  updateRecord(@Req() req: any, @Param('id') id: string, @Body() dto: any) { return this.customObjectsService.updateRecord(req.user.tenantId, id, dto); }

  @Delete('records/:id')
  removeRecord(@Req() req: any, @Param('id') id: string) { return this.customObjectsService.removeRecord(req.user.tenantId, id); }
}
