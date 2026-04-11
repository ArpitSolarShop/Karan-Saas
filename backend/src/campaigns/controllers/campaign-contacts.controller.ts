import { Controller, Get, Post, Delete, Patch, Body, Param, Query, UseGuards, UploadedFile, UseInterceptors, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CampaignContactsService } from '../services/campaign-contacts.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { TenantGuard } from "../../auth/tenant.guard";

@Controller('campaigns/contacts')
@UseGuards(JwtAuthGuard, TenantGuard)
export class CampaignContactsController {
  constructor(private readonly service: CampaignContactsService) {}

  @Post('lists')
  createList(@Req() req: any, @Body() body: any) { return this.service.createList(req.user.tenantId, body); }

  @Get('lists/:campaignId')
  findLists(@Req() req: any, @Param('campaignId') id: string) { return this.service.findLists(req.user.tenantId, id); }

  @Delete('lists/:id')
  deleteList(@Req() req: any, @Param('id') id: string) { return this.service.deleteList(req.user.tenantId, id); }

  @Post('lists/:listId/import')
  importContacts(@Req() req: any, @Param('listId') id: string, @Body() body: { contacts: any[] }) {
    return this.service.importContacts(req.user.tenantId, id, body.contacts);
  }

  @Post('lists/:listId/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadContacts(@Req() req: any, @Param('listId') id: string, @UploadedFile() file: any) {
    return this.service.importFromBuffer(req.user.tenantId, id, file.buffer);
  }

  @Get('lists/:listId/contacts')
  findContacts(@Req() req: any, @Param('listId') id: string, @Query('page') page?: string, @Query('limit') limit?: string, @Query('status') status?: string) {
    return this.service.findContacts(req.user.tenantId, id, page ? parseInt(page) : 1, limit ? parseInt(limit) : 50, status);
  }

  @Patch(':id')
  updateContact(@Req() req: any, @Param('id') id: string, @Body() body: any) { return this.service.updateContact(req.user.tenantId, id, body); }

  @Delete(':id')
  deleteContact(@Req() req: any, @Param('id') id: string) { return this.service.deleteContact(req.user.tenantId, id); }

  @Get(':campaignId/stats')
  getStats(@Req() req: any, @Param('campaignId') id: string) { return this.service.getContactStats(req.user.tenantId, id); }
}
