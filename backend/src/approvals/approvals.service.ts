import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApprovalsService {
  constructor(private prisma: PrismaService) {}

  async createRequest(tenantId: string, requesterId: string, data: any) {
    return this.prisma.approvalRequest.create({
      data: {
        tenantId,
        requesterId,
        entityType: data.entityType,
        entityId: data.entityId,
        notes: data.notes,
      },
    });
  }

  async getPendingRequests(tenantId: string) {
    return this.prisma.approvalRequest.findMany({
      where: { tenantId, status: 'PENDING' },
      include: { requester: { select: { firstName: true, lastName: true } } },
    });
  }

  async resolveRequest(
    id: string,
    tenantId: string,
    approverId: string,
    status: 'APPROVED' | 'REJECTED',
    notes?: string,
  ) {
    const request = await this.prisma.approvalRequest.findFirst({
      where: { id, tenantId },
    });
    if (!request) throw new NotFoundException('Request not found');

    return this.prisma.approvalRequest.update({
      where: { id },
      data: {
        status,
        approverId,
        notes: notes || request.notes,
        resolvedAt: new Date(),
      },
    });
  }
}
