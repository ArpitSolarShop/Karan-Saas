import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttachmentsService {
  constructor(private prisma: PrismaService) {}

  async findAllByLead(leadId: string) {
    return this.prisma.attachment.findMany({
      where: { leadId },
      include: { uploadedBy: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id },
      include: { uploadedBy: { select: { firstName: true, lastName: true } } },
    });
    if (!attachment) throw new NotFoundException('Attachment not found');
    return attachment;
  }

  async create(data: any) {
    return this.prisma.attachment.create({
      data: {
        tenantId: data.tenantId,
        leadId: data.leadId,
        dealId: data.dealId,
        quoteId: data.quoteId,
        uploadedById: data.uploadedById,
        name: data.name,
        url: data.url,
        fileType: data.fileType,
        fileSize: data.fileSize,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.attachment.delete({
      where: { id },
    });
  }
}
