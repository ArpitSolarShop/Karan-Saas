import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { ContactsService } from './contacts.service';
import { LeadConvertService } from './services/lead-convert.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('contacts')
@UseGuards(JwtAuthGuard)
export class ContactsController {
  constructor(
    private readonly contactsService: ContactsService,
    private readonly leadConvertService: LeadConvertService,
  ) {}

  @Post()
  create(@Req() req: any, @Body() body: any) {
    return this.contactsService.create({ ...body, tenantId: req.user.tenantId });
  }

  @Get()
  findAll(@Req() req: any, @Query() query: any) {
    return this.contactsService.findAll(req.user.tenantId, query);
  }

  @Get('search')
  search(@Req() req: any, @Query('q') q: string) {
    return this.contactsService.findAll(req.user.tenantId, { search: q });
  }

  @Get('check-duplicate')
  checkDuplicate(@Req() req: any, @Query('phone') phone: string, @Query('email') email: string) {
    return this.contactsService.checkDuplicate(req.user.tenantId, phone, email);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.contactsService.findOne(id, req.user.tenantId);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.contactsService.update(id, req.user.tenantId, body);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.contactsService.remove(id, req.user.tenantId);
  }

  @Post(':id/tags')
  addTag(@Req() req: any, @Param('id') id: string, @Body('tag') tag: string) {
    return this.contactsService.addTag(id, req.user.tenantId, tag);
  }

  @Delete(':id/tags/:tag')
  removeTag(@Req() req: any, @Param('id') id: string, @Param('tag') tag: string) {
    return this.contactsService.removeTag(id, req.user.tenantId, tag);
  }

  @Post('convert-from-lead')
  convertFromLead(@Req() req: any, @Body() body: any) {
    return this.leadConvertService.convert({
      ...body,
      tenantId: req.user.tenantId,
      userId: req.user.id,
    });
  }
}
