import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Lead → Contact conversion service.
 * Inspired by EspoCRM's ConvertService:
 * - Atomic triple-conversion (Contact + Company + Deal)
 * - Communication history transfer (calls, notes, activities)
 * - Duplicate checking before conversion
 * - Auto-company from email domain (Twenty CRM pattern)
 */
@Injectable()
export class LeadConvertService {
  constructor(private readonly prisma: PrismaService) {}

  async convert(params: {
    leadId: string;
    tenantId: string;
    userId: string;
    contact: {
      firstName: string;
      lastName?: string;
      phone: string;
      email?: string;
      title?: string;
      department?: string;
      contactNumbers?: any;
      emails?: any;
      lifecycle?: string;
      tags?: string[];
    };
    company?: {
      id?: string;         // Existing company ID
      name?: string;       // New company name
      website?: string;
      industry?: string;
    } | null;
    deal?: {
      name: string;
      value: number;
      stage?: string;
      expectedCloseDate?: string;
    } | null;
    transferHistory?: boolean;  // Default: true
  }) {
    const { leadId, tenantId, userId, transferHistory = true } = params;

    return this.prisma.$transaction(async (tx) => {
      // 1. Fetch lead
      const lead = await tx.lead.findFirst({
        where: { id: leadId, tenantId },
        include: { company: true },
      });
      if (!lead) throw new NotFoundException('Lead not found');
      if (lead.status === 'CONVERTED') {
        throw new ConflictException('Lead has already been converted');
      }

      // 2. Duplicate check
      const existingContact = await tx.contact.findFirst({
        where: {
          OR: [
            { phone: params.contact.phone, tenantId },
            ...(params.contact.email ? [{ email: params.contact.email, tenantId }] : []),
          ],
          deletedAt: null,
        },
      });
      if (existingContact) {
        throw new ConflictException({
          message: 'A contact with this phone or email already exists',
          existingContact: { id: existingContact.id, name: existingContact.name, phone: existingContact.phone },
        });
      }

      // 3. Resolve company
      let companyId: string | null = lead.companyId;
      if (params.company) {
        if (params.company.id) {
          companyId = params.company.id;
        } else if (params.company.name) {
          const newCompany = await tx.company.create({
            data: {
              tenantId,
              name: params.company.name,
              website: params.company.website,
              industry: params.company.industry,
            },
          });
          companyId = newCompany.id;
        }
      } else if (!companyId && params.contact.email) {
        const domain = params.contact.email.split('@')[1];
        if (domain && !['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'protonmail.com'].includes(domain)) {
          const companyName = domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
          const existingCompany = await tx.company.findFirst({
            where: { tenantId, website: { contains: domain, mode: 'insensitive' } },
          });
          companyId = existingCompany?.id || null;
          if (!companyId) {
            const autoCompany = await tx.company.create({
              data: { tenantId, name: companyName, website: `https://${domain}` },
            });
            companyId = autoCompany.id;
          }
        }
      }

      // 4. Create Contact
      const now = new Date();
      const contact = await tx.contact.create({
        data: {
          tenantId,
          firstName: params.contact.firstName || lead.firstName,
          lastName: params.contact.lastName || lead.lastName,
          name: `${params.contact.firstName || lead.firstName} ${params.contact.lastName || lead.lastName || ''}`.trim(),
          phone: params.contact.phone || lead.phone,
          contactNumbers: params.contact.contactNumbers || (lead.phoneSecondary ? [lead.phoneSecondary] : []),
          email: params.contact.email || lead.email,
          emails: params.contact.emails || [],
          title: params.contact.title,
          department: params.contact.department,
          source: lead.source,
          lifecycle: params.contact.lifecycle || 'CUSTOMER',
          score: lead.score,
          assignedTo: lead.assignedTo,
          customFields: lead.customFields as any,
          tags: params.contact.tags || lead.tags,
          city: lead.city,
          state: lead.state,
          country: lead.country,
          companyId,
          convertedFromId: lead.id,
          convertedAt: now,
        },
        include: { company: true },
      });

      // 5. Optionally create Deal
      let deal = null;
      if (params.deal) {
        deal = await tx.deal.create({
          data: {
            tenantId,
            leadId: lead.id,
            contactId: contact.id,
            companyId,
            ownerId: userId,
            name: params.deal.name,
            value: params.deal.value,
            stage: params.deal.stage || 'PROSPECTING',
            expectedCloseDate: params.deal.expectedCloseDate ? new Date(params.deal.expectedCloseDate) : null,
          },
        });
      }

      // 6. Transfer communication history
      if (transferHistory) {
        await Promise.all([
          tx.note.updateMany({ where: { leadId: lead.id }, data: { contactId: contact.id } }),
          tx.activity.updateMany({ where: { leadId: lead.id }, data: { contactId: contact.id } }),
          tx.call.updateMany({ where: { leadId: lead.id }, data: { contactId: contact.id } }),
          tx.task.updateMany({ where: { leadId: lead.id }, data: { contactId: contact.id } }),
          tx.attachment.updateMany({ where: { leadId: lead.id }, data: { contactId: contact.id } }),
        ]);
      }

      // 7. Mark Lead as CONVERTED
      await tx.lead.update({
        where: { id: lead.id },
        data: {
          status: 'CONVERTED',
          convertedAt: now,
          convertedToContactId: contact.id,
        },
      });

      // 8. Audit log
      await tx.auditLog.create({
        data: {
          tenantId,
          userId,
          action: 'LEAD_CONVERTED',
          entityType: 'Lead',
          entityId: lead.id,
          details: {
            contactId: contact.id,
            companyId,
            dealId: deal?.id,
            transferredHistory: transferHistory,
          },
        },
      });

      return { contact, deal, companyId };
    });
  }
}
