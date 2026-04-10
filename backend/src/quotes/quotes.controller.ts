import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';
import { Controller, Get, Post, Patch, Param, Body, Res, UseGuards, Req } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import type { Response } from 'express';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Get('lead/:leadId')
  async findAllByLead(@Param('leadId') leadId: string, @Req() req: any) {
    return this.quotesService.findAllByLead(leadId, req.user.tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.quotesService.findOne(id, req.user.tenantId);
  }

  @Get(':id/pdf')
  async getPdf(@Param('id') id: string, @Res() res: Response, @Req() req: any) {
    const pdfBuffer = await this.quotesService.generatePdf(id, req.user.tenantId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=quote-${id}.pdf`,
    );
    res.send(pdfBuffer);
  }

  @Post(':id/pdf')
  async postPdf(@Param('id') id: string, @Res() res: Response, @Req() req: any) {
    const pdfBuffer = await this.quotesService.generatePdf(id, req.user.tenantId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=quote-${id}.pdf`,
    );
    res.send(pdfBuffer);
  }

  @Post()
  async create(@Body() data: any, @Req() req: any) {
    return this.quotesService.create({ ...data, tenantId: req.user.tenantId });
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    return this.quotesService.update(id, req.user.tenantId, data);
  }
}
