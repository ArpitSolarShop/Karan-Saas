import { Controller, Get, Post, Delete, Patch, Body, Param, Query, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CampaignContactsService } from '../services/campaign-contacts.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('campaigns/contacts')
@UseGuards(JwtAuthGuard)
export class CampaignContactsController {
  constructor(private readonly service: CampaignContactsService) {}

  @Post('lists')
  createList(@Body() body: any) { return this.service.createList(body); }

  @Get('lists/:campaignId')
  findLists(@Param('campaignId') id: string) { return this.service.findLists(id); }

  @Delete('lists/:id')
  deleteList(@Param('id') id: string) { return this.service.deleteList(id); }

  @Post('lists/:listId/import')
  importContacts(@Param('listId') id: string, @Body() body: { contacts: any[] }) {
    return this.service.importContacts(id, body.contacts);
  }

  @Post('lists/:listId/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadContacts(@Param('listId') id: string, @UploadedFile() file: any) {
    return this.service.importFromBuffer(id, file.buffer);
  }

  @Get('lists/:listId/contacts')
  findContacts(@Param('listId') id: string, @Query('page') page?: string, @Query('limit') limit?: string, @Query('status') status?: string) {
    return this.service.findContacts(id, page ? parseInt(page) : 1, limit ? parseInt(limit) : 50, status);
  }

  @Patch(':id')
  updateContact(@Param('id') id: string, @Body() body: any) { return this.service.updateContact(id, body); }

  @Delete(':id')
  deleteContact(@Param('id') id: string) { return this.service.deleteContact(id); }

  @Get(':campaignId/stats')
  getStats(@Param('campaignId') id: string) { return this.service.getContactStats(id); }
}
