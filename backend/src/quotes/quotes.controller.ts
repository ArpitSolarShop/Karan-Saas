import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Controller, Get, Post, Patch, Param, Body, Res } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import type { Response } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Get('lead/:leadId')
  findAllByLead(@Param('leadId') leadId: string) {
    return this.quotesService.findAllByLead(leadId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quotesService.findOne(id);
  }

  @Get(':id/pdf')
  async getPdf(@Param('id') id: string, @Res() res: Response) {
    const pdfBuffer = await this.quotesService.generatePdf(id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=quote-${id}.pdf`,
    );
    res.send(pdfBuffer);
  }

  @Post(':id/pdf')
  async postPdf(@Param('id') id: string, @Res() res: Response) {
    const pdfBuffer = await this.quotesService.generatePdf(id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=quote-${id}.pdf`,
    );
    res.send(pdfBuffer);
  }

  @Post()
  create(@Body() data: any) {
    return this.quotesService.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.quotesService.update(id, data);
  }
}
