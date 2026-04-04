import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { InvoiceStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(createPaymentDto: CreatePaymentDto) {
    const payment = await this.prisma.payment.create({
      data: {
        ...createPaymentDto,
        paymentDate: createPaymentDto.paymentDate ? new Date(createPaymentDto.paymentDate) : new Date(),
      },
    });

    if (createPaymentDto.invoiceId) {
      await this.updateInvoiceStatus(createPaymentDto.invoiceId);
    }

    return payment;
  }

  async updateInvoiceStatus(invoiceId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { payments: true },
    });

    if (!invoice) return;

    const totalPaid = invoice.payments
      .filter((p) => p.status === 'RECEIVED')
      .reduce((sum, p) => sum + p.amount, 0);

    let status: InvoiceStatus = invoice.status;

    if (totalPaid >= invoice.total) {
      status = InvoiceStatus.PAID;
    } else if (totalPaid > 0) {
      status = InvoiceStatus.PARTIALLY_PAID;
    }

    if (status !== invoice.status) {
      await this.prisma.invoice.update({
        where: { id: invoiceId },
        data: { status },
      });
    }
  }

  async findAll(tenantId?: string) {
    return this.prisma.payment.findMany({
      where: tenantId ? { tenantId } : undefined,
      include: {
        invoice: { select: { number: true, total: true } },
      },
      orderBy: { paymentDate: 'desc' },
    });
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: { invoice: true },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async remove(id: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    const result = await this.prisma.payment.delete({
      where: { id },
    });

    if (payment?.invoiceId) {
      await this.updateInvoiceStatus(payment.invoiceId);
    }
    return result;
  }
}
