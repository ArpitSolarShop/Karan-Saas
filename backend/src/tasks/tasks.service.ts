import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private auditLogs: AuditLogsService,
  ) {}

  async create(data: {
    tenantId: string;
    leadId?: string;
    assignedTo: string;
    title: string;
    dueDate: Date;
    notes?: string;
  }, userId?: string) {
    const task = await this.prisma.task.create({
      data: {
        tenantId: data.tenantId,
        leadId: data.leadId,
        assignedTo: data.assignedTo,
        title: data.title,
        dueDate: data.dueDate,
        notes: data.notes,
        status: 'PENDING',
      },
    });

    await this.auditLogs.logChange({
      tenantId: data.tenantId,
      userId,
      action: 'TASK_CREATED',
      entityType: 'Task',
      entityId: task.id,
      details: { newValues: task },
    });

    return task;
  }

  async findAll(tenantId: string, assignedTo?: string) {
    return this.prisma.task.findMany({
      where: {
        tenantId,
        ...(assignedTo ? { assignedTo } : {}),
      },
      include: {
        lead: { select: { firstName: true, lastName: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByLead(leadId: string, tenantId: string) {
    return this.prisma.task.findMany({
      where: { leadId, tenantId },
      orderBy: { dueDate: 'asc' },
    });
  }

  async update(id: string, tenantId: string, data: any, userId?: string) {
    const existing = await this.prisma.task.findFirst({ where: { id, tenantId } });
    const task = await this.prisma.task.update({
      where: { id, tenantId },
      data,
    });

    await this.auditLogs.logChange({
      tenantId,
      userId,
      action: 'TASK_UPDATED',
      entityType: 'Task',
      entityId: task.id,
      details: { 
        oldValues: existing, 
        newValues: task 
      },
    });

    return task;
  }

  async remove(id: string, tenantId: string) {
    return this.prisma.task.delete({
      where: { id, tenantId },
    });
  }
}
