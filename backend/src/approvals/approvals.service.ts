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

  async findPending(approverId: string, tenantId: string) {
    return this.prisma.approvalRequest.findMany({
      where: { approverId, tenantId, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(tenantId: string, data: any) {
    return this.prisma.approvalRequest.create({ 
      data: { ...data, tenantId } 
    });
  }

  async approve(id: string, tenantId: string, notes?: string) {
    const req = await this.prisma.approvalRequest.findFirst({ where: { id, tenantId } });
    if (!req) throw new NotFoundException('Approval request not found');
    return this.prisma.approvalRequest.update({
      where: { id, tenantId },
      data: { status: 'APPROVED', notes, resolvedAt: new Date() },
    });
  }

  async reject(id: string, tenantId: string, notes?: string) {
    const req = await this.prisma.approvalRequest.findFirst({ where: { id, tenantId } });
    if (!req) throw new NotFoundException('Approval request not found');
    return this.prisma.approvalRequest.update({
      where: { id, tenantId },
      data: { status: 'REJECTED', notes, resolvedAt: new Date() },
    });
  }
}
