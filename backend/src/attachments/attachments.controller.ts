import {
  Controller, Get, Post, Delete, Param, Body, UseGuards,
  UseInterceptors, UploadedFile, BadRequestException, Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AttachmentsService } from './attachments.service';
import { StorageService } from '../storage/storage.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('attachments')
@UseGuards(JwtAuthGuard)
export class AttachmentsController {
  constructor(
    private readonly attachmentsService: AttachmentsService,
    private readonly storageService: StorageService,
  ) {}

  @Get('lead/:leadId')
  findAllByLead(@Param('leadId') leadId: string) {
    return this.attachmentsService.findAllByLead(leadId);
  }

  /**
   * POST /attachments/upload
   * Accepts a multipart file, uploads to MinIO, then creates the DB record.
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('leadId') leadId: string,
    @Body('dealId') dealId?: string,
    @Body('quoteId') quoteId?: string,
    @Body('uploadedById') uploadedById?: string,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');

    // Upload to MinIO and get the storage key
    const key = this.storageService.getAttachmentKey(leadId || 'general', file.originalname);
    await this.storageService.uploadFile(file.buffer, key, file.mimetype);
    const url = await this.storageService.getSignedUrl(key, 3600 * 24 * 365); // 1-year signed URL

    // Save metadata to DB
    const attachment = await this.attachmentsService.create({
      tenantId: 'dev-tenant-001',
      leadId,
      dealId,
      quoteId,
      uploadedById,
      name: file.originalname,
      url,
      fileType: file.mimetype,
      fileSize: file.size,
    });

    return { ...attachment, storageKey: key };
  }

  /**
   * POST /attachments (legacy — metadata only, no file)
   */
  @Post()
  create(@Body() data: any) {
    return this.attachmentsService.create(data);
  }

  /**
   * GET /attachments/:id/signed-url — refreshes a pre-signed download URL
   */
  @Get(':id/signed-url')
  async getSignedUrl(@Param('id') id: string, @Query('ttl') ttl?: string) {
    const att = await this.attachmentsService.findOne(id);
    // Extract key from URL or reconstruct it
    const key = this.storageService.getAttachmentKey(att.leadId || 'general', att.name);
    const url = await this.storageService.getSignedUrl(key, ttl ? parseInt(ttl) : 3600);
    return { url };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const att = await this.attachmentsService.findOne(id);
    // Delete from MinIO too
    try {
      const key = this.storageService.getAttachmentKey(att.leadId || 'general', att.name);
      await this.storageService.deleteFile(key);
    } catch {}
    return this.attachmentsService.remove(id);
  }
}
