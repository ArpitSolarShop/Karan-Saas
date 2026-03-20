import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DealsService {
  constructor(private prisma: PrismaService) {}

  async findAllByLead(leadId: string) {
    return this.prisma.deal.findMany({
      where: { leadId },
      include: { owner: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const deal = await this.prisma.deal.findUnique({
      where: { id },
      include: { 
        lead: true, 
        owner: { select: { firstName: true, lastName: true } },
        quotes: true,
        attachments: true
      },
    });
    if (!deal) throw new NotFoundException('Deal not found');
    return deal;
  }

  async create(data: any) {
    return this.prisma.deal.create({
      data: {
        tenantId: data.tenantId,
        leadId: data.leadId,
        ownerId: data.ownerId,
        name: data.name,
        value: data.value || 0,
        currency: data.currency || 'INR',
        stage: data.stage || 'PROSPECTING',
        probability: data.probability || 10,
        expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate) : null,
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.deal.update({
      where: { id },
      data,
    });
  }
}
