import { UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';
import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { NotesService } from './notes.service';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  create(@Body() body: any, @Req() req: any) {
    return this.notesService.create({
      ...body,
      tenantId: req.tenantId || req.user.tenantId,
    }, req.user?.id);
  }

  @Get('lead/:leadId')
  findByLead(@Param('leadId') leadId: string, @Req() req: any) {
    return this.notesService.findByLead(leadId, req.tenantId || req.user.tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notesService.remove(id);
  }
}
