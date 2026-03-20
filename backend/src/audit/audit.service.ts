import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  /**
   * Logs a sensitive event to the AuditLog table.
   */
  async record(params: {
    tenantId: string;
    userId?: string;
    entityType: string;
    entityId: string;
    action: string;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        tenantId: params.tenantId,
        userId: params.userId,
        entityType: params.entityType,
        entityId: params.entityId,
        action: params.action,
        oldValues: params.oldValues || {},
        newValues: params.newValues || {},
        ipAddress: params.ipAddress,
      },
    });
  }

  async getRecent(tenantId: string) {
    return this.prisma.auditLog.findMany({
      where: { tenantId },
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
