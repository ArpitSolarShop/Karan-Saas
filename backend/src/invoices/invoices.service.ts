import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId?: string) {
    return this.prisma.invoice.findMany({
      where: tenantId ? { tenantId } : undefined,
      include: {
        company: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        company: true,
        lineItems: { include: { product: true } },
        payments: true,
      },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async create(createInvoiceDto: CreateInvoiceDto) {
    const { lineItems, ...invoiceData } = createInvoiceDto;

    // Generate Invoice Number if not provided
    const invoiceNumber =
      createInvoiceDto.number ||
      (await this.prisma.getNextNumber(createInvoiceDto.tenantId, 'INVOICE'));

    // Calculate totals from line items
    let subtotal = 0;
    let taxAmount = 0;
    let discountAmount = 0;

    const mappedLineItems = lineItems.map((item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const itemTax = itemSubtotal * ((item.taxRate || 0) / 100);
      const itemDiscount = item.discount || 0;
      const itemTotal = itemSubtotal + itemTax - itemDiscount;

      subtotal += itemSubtotal;
      taxAmount += itemTax;
      discountAmount += itemDiscount;

      return {
        ...item,
        total: itemTotal,
      };
    });

    const total = subtotal + taxAmount - discountAmount;

    return this.prisma.invoice.create({
      data: {
        ...invoiceData,
        number: invoiceNumber,
        subtotal,
        taxAmount,
        discountAmount,
        total,
        lineItems: {
          create: mappedLineItems,
        },
      },
      include: {
        lineItems: true,
      },
    });
  }

  async update(id: string, updateInvoiceDto: UpdateInvoiceDto) {
    const { tenantId, createdBy, lineItems, ...updateData } = updateInvoiceDto as any;
    // Note: status updates might trigger other logic (e.g. payment recording)
    // For now simple update
    return this.prisma.invoice.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    return this.prisma.invoice.delete({
      where: { id },
    });
  }
}
