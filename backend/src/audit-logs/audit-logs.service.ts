import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  async logChange(data: {
    tenantId: string;
    userId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    details?: {
      oldValues?: any;
      newValues?: any;
      ipAddress?: string;
      metadata?: any;
    };
  }) {
    return this.prisma.auditLog.create({
      data: {
        tenantId: data.tenantId,
        userId: data.userId || null,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        details: data.details || {},
      },
    });
  }

  async findByEntity(entityType: string, entityId: string, tenantId: string) {
    return this.prisma.auditLog.findMany({
      where: { entityType, entityId, tenantId },
      include: { user: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async findRecent(tenantId: string) {
    return this.prisma.auditLog.findMany({
      where: { tenantId },
      include: { user: { select: { firstName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }
}
