import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AiService } from '../ai/ai.service';
import { WhatsAppService } from '../communications/providers/whatsapp.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import axios from 'axios';

@Injectable()
export class WorkflowsService {
  private readonly logger = new Logger(WorkflowsService.name);

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private ai: AiService,
    private whatsapp: WhatsAppService,
    private auditLogs: AuditLogsService,
  ) {}

  // Strict production isolation: no legacy dev fallbacks.

  // ── CRUD ──────────────────────────────────────────────────────────────────
  async findAll(tenantId: string) {
    return this.prisma.workflowRule.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: {
    name: string;
    trigger: string;
    condition?: any;
    action: string;
    actionParams?: any;
    tenantId: string;
  }) {
    const tenantId = data.tenantId;
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

  async update(
    id: string,
    tenantId: string,
    data: Partial<{
      name: string;
      isActive: boolean;
      action: string;
      actionParams: any;
      condition: any;
    }>,
  ) {
    return this.prisma.workflowRule.update({
      where: { id, tenantId },
      data: data as any,
    });
  }

  async delete(id: string, tenantId: string) {
    return this.prisma.workflowRule.delete({ where: { id, tenantId } });
  }

  // ── Engine: execute matching rules ────────────────────────────────────────
  async executeRules(
    trigger: string,
    context: {
      leadId?: string;
      leadName?: string;
      phone?: string;
      email?: string;
      agentId?: string;
      disposition?: string;
      status?: string;
      tenantId: string;
    },
  ) {
    const rules = (await this.prisma.workflowRule.findMany({
      where: { 
        trigger: trigger as any, 
        isActive: true,
        tenantId: context.tenantId 
      },
    })) as any[];

    for (const rule of rules) {
      try {
        await this.executeAction(rule, context);
        await this.prisma.workflowRule.update({
          where: { id: rule.id },
          data: { runCount: { increment: 1 }, lastRunAt: new Date() } as any,
        });

        // 200% Feature: Log Automation Execution in Audit Trail
        await this.auditLogs.logChange({
          tenantId: context.tenantId,
          action: 'WORKFLOW_GENESIS',
          entityType: 'Lead',
          entityId: context.leadId,
          details: { 
            metadata: {
              ruleName: rule.name, 
              trigger, 
              action: rule.action 
            }
          },
        });
      } catch (err) {
        this.logger.error(`[Workflow] Rule ${rule.name} failed: ${err.message}`);
      }
    }
  }

  private interpolate(template: string, context: Record<string, any>): string {
    return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_, path) => {
      const parts = path.split('.');
      let val: any = context;
      for (const p of parts) {
        val = val?.[p];
      }
      return String(val ?? '');
    });
  }

  private async executeAction(rule: any, context: Record<string, any>) {
    const params = rule.actionParams || {};
    const message = params.message
      ? this.interpolate(params.message, context)
      : '';

    switch (rule.action) {
      case 'TRIGGER_WEBHOOK':
        if (params.url) {
          try {
            await axios.post(params.url, {
              ruleName: rule.name,
              trigger: rule.trigger,
              timestamp: new Date().toISOString(),
              context,
              message,
            }, {
              headers: { 'X-CRM-Workflow-Signature': 'superior-crm-v1' }
            });
            this.logger.log(`[Workflow] Webhook triggered to ${params.url}`);
          } catch (err) {
            this.logger.error(`[Workflow] Webhook failed to ${params.url}: ${err.message}`);
          }
        }
        break;

      case 'SEND_WHATSAPP':
        if (context.leadId && context.phone) {
          this.logger.log(`[Workflow] Sending WA to ${context.phone}`);
          try {
            const result = await this.whatsapp.sendMessage(context.phone, message, context.tenantId);
            if (result.success) {
              this.logger.log(`[Workflow] WA sent successfully to ${context.phone}`);
            } else {
              this.logger.warn(`[Workflow] WA failed to ${context.phone}`);
            }
          } catch (err) {
            this.logger.error(`[Workflow] WA execution failed: ${err.message}`);
          }
        }
        break;

      case 'CREATE_NOTIFICATION':
        if (context.agentId) {
          await this.notifications.create({
            tenantId: context.tenantId,
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
          await this.prisma.lead.update({
            where: { id: context.leadId, tenantId: context.tenantId },
            data: { status: params.status },
          });
        }
        break;

      case 'CREATE_TASK':
        if (context.leadId) {
          await this.prisma.task.create({
            data: {
              tenantId: context.tenantId,
              leadId: context.leadId,
              title: message || `Follow up with ${context.leadName}`,
              status: 'PENDING',
              priority: 'MEDIUM',
              dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            } as any,
          });
        }
        break;

      case 'AI_EVALUATE_LEAD':
        if (context.leadId) {
          this.logger.log(`[Workflow] Triggering AI Engine Lead Evaluation for ${context.leadId}`);
          try {
             const aiEval = await this.ai.evaluateLeadAction(context);
             
             // 1. Log AI output as a Timeline Note
             await this.prisma.note.create({
               data: {
                 content: `🤖 [AI Trifold Engine]\n\nAnalysis: ${aiEval.summary}\nPriority: ${aiEval.suggestedPriority}`,
                 leadId: context.leadId,
                 userId: 'SYSTEM',
                 tenantId: context.tenantId
               } as any
             });

             // 2. Set Status (e.g. if priority is HIGH, set INTERESTED)
             if (aiEval.suggestedPriority === 'HIGH') {
                await this.prisma.lead.update({
                  where: { id: context.leadId, tenantId: context.tenantId },
                  data: { status: 'INTERESTED' }
                });
             }
          } catch (e) {
             this.logger.error(`[Workflow] AI Evaluation failed: ${e.message}`);
          }
        }
        break;

      default:
        this.logger.warn(`[Workflow] Unknown action: ${rule.action}`);
    }
  }
}
