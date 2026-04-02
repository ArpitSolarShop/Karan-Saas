import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CustomObjectsService } from './custom-objects.service';

@Controller('custom-objects')
export class CustomObjectsController {
  constructor(private readonly customObjectsService: CustomObjectsService) {}

  // ── Schemas ──
  @Post('schemas')
  createSchema(@Body() dto: any) { return this.customObjectsService.createSchema(dto); }

  @Get('schemas')
  findAllSchemas(@Query('tenantId') tenantId: string) { return this.customObjectsService.findAllSchemas(tenantId); }

  @Get('schemas/:id')
  findOneSchema(@Param('id') id: string) { return this.customObjectsService.findOneSchema(id); }

  @Patch('schemas/:id')
  updateSchema(@Param('id') id: string, @Body() dto: any) { return this.customObjectsService.updateSchema(id, dto); }

  @Delete('schemas/:id')
  removeSchema(@Param('id') id: string) { return this.customObjectsService.removeSchema(id); }

  // ── Records ──
  @Post('schemas/:schemaId/records')
  createRecord(@Param('schemaId') schemaId: string, @Body() dto: any) { return this.customObjectsService.createRecord(schemaId, dto); }

  @Get('schemas/:schemaId/records')
  findAllRecords(@Param('schemaId') schemaId: string) { return this.customObjectsService.findAllRecords(schemaId); }

  @Patch('records/:id')
  updateRecord(@Param('id') id: string, @Body() dto: any) { return this.customObjectsService.updateRecord(id, dto); }

  @Delete('records/:id')
  removeRecord(@Param('id') id: string) { return this.customObjectsService.removeRecord(id); }
}
