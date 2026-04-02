import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DocumentsService } from './documents.service';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  // ── Folders ──
  @Get('folders')
  findAllFolders(@Query('tenantId') tenantId: string) { return this.documentsService.findAllFolders(tenantId); }

  @Post('folders')
  createFolder(@Body() dto: any) { return this.documentsService.createFolder(dto); }

  @Patch('folders/:id')
  updateFolder(@Param('id') id: string, @Body() dto: any) { return this.documentsService.updateFolder(id, dto); }

  @Delete('folders/:id')
  removeFolder(@Param('id') id: string) { return this.documentsService.removeFolder(id); }

  // ── Documents ──
  @Post()
  create(@Body() dto: any) { return this.documentsService.create(dto); }

  @Get()
  findAll(@Query('tenantId') tenantId: string, @Query('folderId') folderId?: string) {
    return this.documentsService.findAll(tenantId, folderId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.documentsService.findOne(id); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any) { return this.documentsService.update(id, dto); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.documentsService.remove(id); }
}
