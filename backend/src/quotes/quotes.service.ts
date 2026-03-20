import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import PDFDocument from 'pdfkit';

@Injectable()
export class QuotesService {
  constructor(private prisma: PrismaService) {}

  async findAllByLead(leadId: string) {
    return this.prisma.quote.findMany({
      where: { leadId },
      include: { 
        author: { select: { firstName: true, lastName: true } },
        deal: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const quote = await this.prisma.quote.findUnique({
      where: { id },
      include: { 
        lead: true, 
        author: { select: { firstName: true, lastName: true } },
        deal: true,
        attachments: true
      },
    });
    if (!quote) throw new NotFoundException('Quote not found');
    return quote;
  }

  async create(data: any) {
    return this.prisma.quote.create({
      data: {
        tenantId: data.tenantId,
        leadId: data.leadId,
        dealId: data.dealId,
        authorId: data.authorId,
        version: data.version || 'v1',
        totalValue: data.totalValue || 0,
        status: data.status || 'DRAFT',
        lineItems: data.lineItems || [],
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.quote.update({
      where: { id },
      data,
    });
  }

  /** Generate a PDF buffer for a quote */
  async generatePdf(id: string): Promise<Buffer> {
    const quote = await this.findOne(id);
    const lineItems: any[] = Array.isArray(quote.lineItems) ? (quote.lineItems as any[]) : [];

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(22).font('Helvetica-Bold').text('QUOTATION', { align: 'right' });
      doc.fontSize(10).font('Helvetica').fillColor('#888888')
        .text(`Quote ID: ${quote.id}`, { align: 'right' })
        .text(`Version: ${quote.version}`, { align: 'right' })
        .text(`Status: ${quote.status}`, { align: 'right' })
        .text(`Date: ${new Date(quote.createdAt).toLocaleDateString()}`, { align: 'right' });

      if (quote.validUntil) {
        doc.text(`Valid Until: ${new Date(quote.validUntil).toLocaleDateString()}`, { align: 'right' });
      }

      doc.moveDown(2);

      // Lead / customer info
      const lead = quote.lead as any;
      const author = quote.author as any;
      doc.fillColor('#000000').fontSize(13).font('Helvetica-Bold').text('Prepared For:');
      doc.fontSize(11).font('Helvetica')
        .text(lead?.name || lead?.firstName || 'Customer')
        .text(lead?.phone || '')
        .text(lead?.email || '')
        .text(lead?.company || '');

      doc.moveDown();
      if (author) {
        doc.fontSize(11).font('Helvetica-Bold').text('Prepared By:');
        doc.font('Helvetica').text(`${author.firstName || ''} ${author.lastName || ''}`.trim());
      }

      doc.moveDown(2);

      // Line items table
      doc.fontSize(13).font('Helvetica-Bold').text('Line Items');
      doc.moveDown(0.5);

      const tableTop = doc.y;
      const col = { name: 50, qty: 280, price: 360, total: 440 };
      const rowH = 22;

      // Table header
      doc.rect(50, tableTop, 510, rowH).fill('#2563EB');
      doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold');
      doc.text('Item / Description', col.name, tableTop + 6, { width: 220 });
      doc.text('Qty', col.qty, tableTop + 6, { width: 70, align: 'center' });
      doc.text('Unit Price', col.price, tableTop + 6, { width: 80, align: 'right' });
      doc.text('Total', col.total, tableTop + 6, { width: 80, align: 'right' });

      let y = tableTop + rowH;
      doc.fillColor('#000000').font('Helvetica').fontSize(9);

      lineItems.forEach((item: any, i: number) => {
        const bg = i % 2 === 0 ? '#F9FAFB' : '#FFFFFF';
        doc.rect(50, y, 510, rowH).fill(bg);
        doc.fillColor('#000000');
        doc.text(item.description || item.name || `Item ${i + 1}`, col.name, y + 6, { width: 220 });
        doc.text(String(item.qty ?? item.quantity ?? 1), col.qty, y + 6, { width: 70, align: 'center' });
        const unit = parseFloat(item.unitPrice ?? item.price ?? 0);
        const qty  = parseFloat(item.qty ?? item.quantity ?? 1);
        const total = (unit * qty).toFixed(2);
        doc.text(`₹${unit.toFixed(2)}`, col.price, y + 6, { width: 80, align: 'right' });
        doc.text(`₹${total}`, col.total, y + 6, { width: 80, align: 'right' });
        y += rowH;
      });

      // Total row
      doc.rect(50, y, 510, rowH + 4).fill('#1E3A5F');
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(10);
      doc.text('TOTAL', col.name, y + 6);
      const totalVal = parseFloat(String(quote.totalValue ?? 0));
      doc.text(`₹${totalVal.toFixed(2)}`, col.total, y + 6, { width: 80, align: 'right' });

      doc.moveDown(4);
      doc.fillColor('#888888').fontSize(8).font('Helvetica')
        .text('This is a computer-generated document. No signature is required.', { align: 'center' });

      doc.end();
    });
  }
}
