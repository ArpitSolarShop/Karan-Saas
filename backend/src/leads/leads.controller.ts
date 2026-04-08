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
  Req,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { LeadsService } from './leads.service';
import { DedupeService } from './services/dedupe.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';

@Controller('leads')
@UseGuards(JwtAuthGuard, TenantGuard)
export class LeadsController {
  constructor(
    private readonly leadsService: LeadsService,
    private readonly dedupeService: DedupeService,
  ) {}

  @Post()
  create(@Body() createLeadDto: CreateLeadDto, @Req() req: any) {
    return this.leadsService.create({
      ...createLeadDto,
      tenantId: req.tenantId || req.user.tenantId,
    });
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importLeads(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    if (!file) throw new BadRequestException('No file uploaded');
    const tenantId = req.tenantId || req.user.tenantId;
    return this.leadsService.importLeads(
      tenantId,
      file.buffer,
      file.originalname,
      file.mimetype,
    );
  }

  @Get('import-history')
  getImportHistory(@Req() req: any) {
    return this.leadsService.getImportHistory(req.tenantId || req.user.tenantId);
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
    @Req() req: any,
  ) {
    return this.leadsService.bulkAction(
      req.tenantId || req.user.tenantId,
      body.action,
      body.ids,
      body.value,
    );
  }

  /**
   * GET /leads/export — download all (or filtered) leads as CSV
   */
  @Get('export')
  async exportCsv(
    @Res() res: any,
    @Req() req: any,
    @Query('status') status?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('tags') tags?: string,
  ) {
    const csv = await this.leadsService.exportCsv(
      req.tenantId || req.user.tenantId,
      {
        status,
        assignedTo,
        tags: tags ? tags.split(',') : undefined,
      },
    );
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="leads-${Date.now()}.csv"`,
    );
    res.send(csv);
  }

  @Get()
  findAll(
    @Req() req: any,
    @Query('status') status?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('tag') tag?: string,
  ) {
    return this.leadsService.findAll(req.tenantId || req.user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.leadsService.findOne(id, req.tenantId || req.user.tenantId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLeadDto: UpdateLeadDto,
    @Req() req: any,
  ) {
    return this.leadsService.update(
      id,
      req.tenantId || req.user.tenantId,
      updateLeadDto,
    );
  }

  @Post(':id/tags')
  addTag(@Param('id') id: string, @Body('tag') tag: string, @Req() req: any) {
    return this.leadsService.addTag(id, req.tenantId || req.user.tenantId, tag);
  }

  @Delete(':id/tags/:tag')
  removeTag(
    @Param('id') id: string,
    @Param('tag') tag: string,
    @Req() req: any,
  ) {
    return this.leadsService.removeTag(
      id,
      req.tenantId || req.user.tenantId,
      tag,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.leadsService.remove(id, req.tenantId || req.user.tenantId);
  }

  // ── Deduplication ──────────────────────────────────────────────────────────

  @Get('dedupe/scan')
  async scanDuplicates(@Req() req: any) {
    const tenantId = req.tenantId || req.user.tenantId;
    return this.dedupeService.findPotentialDuplicates(tenantId);
  }

  @Post('dedupe/merge')
  async mergeDuplicates(
    @Body() body: { primaryId: string; secondaryIds: string[] },
    @Req() req: any,
  ) {
    return this.dedupeService.mergeLeads(
      req.tenantId || req.user.tenantId,
      body.primaryId,
      body.secondaryIds,
    );
  }
}
