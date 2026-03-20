import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CommunicationsService } from '../communications/communications.service';
import { TasksService } from '../tasks/tasks.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Logger } from '@nestjs/common';

@Injectable()
export class WorkflowsService {
  private readonly logger = new Logger(WorkflowsService.name);

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  private async ensureDevTenant(): Promise<string> {
    const tenantId = 'dev-tenant-001';
    return tenantId;
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────
  async findAll(tenantId?: string) {
    return this.prisma.workflowRule.findMany({
      where: tenantId ? { tenantId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: {
    name: string;
    trigger: string;
    condition?: any;
    action: string;
    actionParams?: any;
    tenantId?: string;
  }) {
    const tenantId = data.tenantId || await this.ensureDevTenant();
    return this.prisma.workflowRule.create({
      data: {
        tenantId,
        name: data.name,
        trigger: data.trigger as any,
        condition: data.condition || {},
        action: data.action as any,
        actionParams: data.actionParams || {},
        isActive: true,
      },
    });
  }

  async update(id: string, data: Partial<{ name: string; isActive: boolean; action: string; actionParams: any; condition: any }>) {
    return this.prisma.workflowRule.update({ where: { id }, data: data as any });
  }

  async delete(id: string) {
    return this.prisma.workflowRule.delete({ where: { id } });
  }

  // ── Engine: execute matching rules ────────────────────────────────────────
  async executeRules(trigger: string, context: {
    leadId?: string;
    leadName?: string;
    phone?: string;
    email?: string;
    agentId?: string;
    disposition?: string;
    status?: string;
    tenantId?: string;
  }) {
    const rules = await this.prisma.workflowRule.findMany({
      where: { trigger: trigger as any, isActive: true },
    }) as any[];

    for (const rule of rules) {
      try {
        await this.executeAction(rule, context);
        await this.prisma.workflowRule.update({
          where: { id: rule.id },
          data: { runCount: { increment: 1 }, lastRunAt: new Date() } as any,
        });
      } catch (err) {
        this.logger.error(`[Workflow] Rule ${rule.name} failed: ${err}`);
      }
    }
  }

  private interpolate(template: string, context: Record<string, any>): string {
    return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_, path) => {
      const parts = path.split('.');
      let val: any = context;
      for (const p of parts) { val = val?.[p]; }
      return String(val ?? '');
    });
  }

  private async executeAction(rule: any, context: Record<string, any>) {
    const params = rule.actionParams || {};
    const message = params.message ? this.interpolate(params.message, context) : '';

    switch (rule.action) {
      case 'SEND_WHATSAPP':
        if (context.leadId && context.phone) {
          // Fire via notifications service stub (real WA via CommunicationsService)
          this.logger.log(`[Workflow] WA to ${context.phone}: ${message}`);
        }
        break;

      case 'CREATE_NOTIFICATION':
        if (context.agentId) {
          await this.notifications.create({
            recipientId: context.agentId,
            type: 'WORKFLOW',
            title: rule.name,
            body: message || `Workflow triggered: ${rule.name}`,
            entityType: 'Lead',
            entityId: context.leadId,
          });
        }
        break;

      case 'UPDATE_LEAD_STATUS':
        if (context.leadId && params.status) {
          await this.prisma.lead.update({ where: { id: context.leadId }, data: { status: params.status as any } });
        }
        break;

      case 'CREATE_TASK':
        if (context.leadId) {
          await this.prisma.task.create({
            data: {
              tenantId: context.tenantId || 'dev-tenant-001',
              leadId: context.leadId,
              title: message || `Follow up with ${context.leadName}`,
              status: 'PENDING',
              priority: 'MEDIUM',
              dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            } as any,
          });
        }
        break;

      default:
        this.logger.warn(`[Workflow] Unknown action: ${rule.action}`);
    }
  }
}
