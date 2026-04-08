import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, recipientId?: string) {
    return this.prisma.notification.findMany({
      where: { 
        tenantId,
        ...(recipientId && { recipientId })
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async findUnread(tenantId: string, recipientId: string) {
    return this.prisma.notification.findMany({
      where: { tenantId, recipientId, isRead: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: {
    recipientId: string;
    type: string;
    title: string;
    body?: string;
    entityType?: string;
    entityId?: string;
    tenantId: string;
  }) {
    return this.prisma.notification.create({
      data: {
        tenantId: data.tenantId,
        recipientId: data.recipientId,
        type: data.type,
        title: data.title,
        body: data.body,
        entityType: data.entityType,
        entityId: data.entityId,
      },
    });
  }

  async markRead(id: string, tenantId: string) {
    return this.prisma.notification.update({
      where: { id, tenantId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllRead(tenantId: string, recipientId: string) {
    return this.prisma.notification.updateMany({
      where: { tenantId, recipientId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  // ── Suppressions (DNC) ──
  async findAllSuppressions(tenantId: string) {
    return this.prisma.suppression.findMany({
      where: { tenantId },
      orderBy: { addedAt: 'desc' },
    });
  }

  async addSuppression(data: {
    phoneE164: string;
    type: string;
    reason?: string;
    addedBy?: string;
    tenantId: string;
  }) {
    return this.prisma.suppression.create({
      data: {
        tenantId: data.tenantId,
        phoneE164: data.phoneE164,
        type: data.type,
        reason: data.reason,
        addedBy: data.addedBy,
      },
    });
  }

  async checkDnc(tenantId: string, phone: string) {
    const suppression = await this.prisma.suppression.findFirst({
      where: { tenantId, phoneE164: phone },
    });
    return { isDnc: !!suppression, suppression };
  }

  async removeSuppression(id: string, tenantId: string) {
    return this.prisma.suppression.delete({ where: { id, tenantId } });
  }

  // ── Audit Logs ──
  async logAction(data: {
    userId?: string;
    entityType: string;
    entityId: string;
    action: string;
    oldValues?: any;
    newValues?: any;
    tenantId: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        tenantId: data.tenantId,
        userId: data.userId,
        entityType: data.entityType,
        entityId: data.entityId,
        action: data.action,
        details: {
          oldValues: data.oldValues ?? null,
          newValues: data.newValues ?? null,
        },
      },
    });
  }

  async getAuditTrail(tenantId: string, entityType?: string, entityId?: string) {
    return this.prisma.auditLog.findMany({
      where: {
        tenantId,
        ...(entityType && { entityType }),
        ...(entityId && { entityId }),
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
