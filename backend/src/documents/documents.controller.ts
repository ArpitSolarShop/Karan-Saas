import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';

@Controller('documents')
@UseGuards(JwtAuthGuard, TenantGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  // ── Folders ──
  @Get('folders')
  findAllFolders(@Req() req: any) { 
    return this.documentsService.findAllFolders(req.user.tenantId); 
  }

  @Post('folders')
  createFolder(@Req() req: any, @Body() dto: any) { 
    return this.documentsService.createFolder(req.user.tenantId, dto); 
  }

  @Patch('folders/:id')
  updateFolder(@Req() req: any, @Param('id') id: string, @Body() dto: any) { 
    return this.documentsService.updateFolder(id, req.user.tenantId, dto); 
  }

  @Delete('folders/:id')
  removeFolder(@Req() req: any, @Param('id') id: string) { 
    return this.documentsService.removeFolder(id, req.user.tenantId); 
  }

  // ── Documents ──
  @Post()
  create(@Req() req: any, @Body() dto: any) { 
    return this.documentsService.create(req.user.tenantId, dto); 
  }

  @Get()
  findAll(@Req() req: any, @Query('folderId') folderId?: string) {
    return this.documentsService.findAll(req.user.tenantId, folderId);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) { 
    return this.documentsService.findOne(id, req.user.tenantId); 
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: any) { 
    return this.documentsService.update(id, req.user.tenantId, dto); 
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) { 
    return this.documentsService.remove(id, req.user.tenantId); 
  }
}
