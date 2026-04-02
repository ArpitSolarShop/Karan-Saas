import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApprovalsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.approvalRequest.findMany({
      where: { tenantId },
      include: { requester: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPending(approverId: string) {
    return this.prisma.approvalRequest.findMany({
      where: { approverId, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: any) {
    return this.prisma.approvalRequest.create({ data });
  }

  async approve(id: string, notes?: string) {
    const req = await this.prisma.approvalRequest.findUnique({ where: { id } });
    if (!req) throw new NotFoundException('Approval request not found');
    return this.prisma.approvalRequest.update({
      where: { id },
      data: { status: 'APPROVED', notes, resolvedAt: new Date() },
    });
  }

  async reject(id: string, notes?: string) {
    const req = await this.prisma.approvalRequest.findUnique({ where: { id } });
    if (!req) throw new NotFoundException('Approval request not found');
    return this.prisma.approvalRequest.update({
      where: { id },
      data: { status: 'REJECTED', notes, resolvedAt: new Date() },
    });
  }
}
