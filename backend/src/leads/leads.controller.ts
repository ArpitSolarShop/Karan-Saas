import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('leads')
@UseGuards(JwtAuthGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  create(@Body() createLeadDto: CreateLeadDto) {
    return this.leadsService.create(createLeadDto);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importLeads(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    return this.leadsService.importLeads(
      file.buffer,
      file.originalname,
      file.mimetype,
    );
  }

  @Get('import-history')
  getImportHistory() {
    return this.leadsService.getImportHistory();
  }

  /**
   * POST /leads/bulk — bulk assign / tag / delete / status
   * Body: { action: 'assign'|'tag'|'delete'|'status', ids: string[], value: any }
   */
  @Post('bulk')
  bulkAction(
    @Body()
    body: {
      action: 'assign' | 'tag' | 'delete' | 'status';
      ids: string[];
      value?: any;
    },
  ) {
    return this.leadsService.bulkAction(body.action, body.ids, body.value);
  }

  /**
   * GET /leads/export — download all (or filtered) leads as CSV
   */
  @Get('export')
  async exportCsv(
    @Res() res: any,
    @Query('status') status?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('tags') tags?: string,
  ) {
    const csv = await this.leadsService.exportCsv({
      status,
      assignedTo,
      tags: tags ? tags.split(',') : undefined,
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="leads-${Date.now()}.csv"`,
    );
    res.send(csv);
  }

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('tag') tag?: string,
  ) {
    return this.leadsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLeadDto: UpdateLeadDto) {
    return this.leadsService.update(id, updateLeadDto);
  }

  @Post(':id/tags')
  addTag(@Param('id') id: string, @Body('tag') tag: string) {
    return this.leadsService.addTag(id, tag);
  }

  @Delete(':id/tags/:tag')
  removeTag(@Param('id') id: string, @Param('tag') tag: string) {
    return this.leadsService.removeTag(id, tag);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leadsService.remove(id);
  }
}
