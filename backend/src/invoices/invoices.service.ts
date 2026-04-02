import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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

  async create(data: any) {
    // Generate Invoice Number properly
    // For now we do a simple fallback
    const number = data.number || `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    return this.prisma.invoice.create({
      data: {
        tenantId: data.tenantId,
        number: number,
        status: data.status || 'DRAFT',
        dueDate: data.dueDate ? new Date(data.dueDate) : new Date(new Date().setDate(new Date().getDate() + 14)), // default 14 days
        subtotal: data.subtotal || 0,
        taxAmount: data.taxAmount || 0,
        discountAmount: data.discountAmount || 0,
        total: data.total || 0,
        currency: data.currency || 'INR',
        companyId: data.companyId,
        createdBy: data.createdBy,
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.invoice.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.invoice.delete({
      where: { id },
    });
  }
}
