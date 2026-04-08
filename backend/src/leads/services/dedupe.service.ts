import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DedupeService {
  constructor(private prisma: PrismaService) {}

  async findPotentialDuplicates(tenantId: string) {
    // 1. Find duplicate phones
    const duplicatePhones = await this.prisma.$queryRaw`
      SELECT phone, COUNT(*) as count
      FROM leads
      WHERE "tenantId" = ${tenantId} AND phone != '' AND "deletedAt" IS NULL
      GROUP BY phone
      HAVING COUNT(*) > 1
    `;

    // 2. Find duplicate emails
    const duplicateEmails = await this.prisma.$queryRaw`
      SELECT email, COUNT(*) as count
      FROM leads
      WHERE "tenantId" = ${tenantId} AND email IS NOT NULL AND email != '' AND "deletedAt" IS NULL
      GROUP BY email
      HAVING COUNT(*) > 1
    `;

    // 3. Find potentially matching names (simplified fuzzy)
    // In a real prod env, we'd use pg_trgm or Levenshtein, but for "Alpha 100%" we'll do name match
    const duplicateNames = await this.prisma.$queryRaw`
      SELECT name, COUNT(*) as count
      FROM leads
      WHERE "tenantId" = ${tenantId} AND name IS NOT NULL AND name != '' AND "deletedAt" IS NULL
      GROUP BY name
      HAVING COUNT(*) > 1
    `;

    return {
      phones: duplicatePhones,
      emails: duplicateEmails,
      names: duplicateNames,
    };
  }

  async getDuplicatesByPhone(tenantId: string, phone: string) {
    return this.prisma.lead.findMany({
      where: { tenantId, phone, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async mergeLeads(tenantId: string, primaryId: string, secondaryIds: string[]) {
    const primaryLead = await this.prisma.lead.findUnique({ 
      where: { id: primaryId, tenantId } 
    });
    if (!primaryLead) throw new Error('Primary lead not found in this tenant context.');

    // 1. Move related data to primary (Calls, Notes, Tasks, etc.)
    for (const secondaryId of secondaryIds) {
      // Ensure the secondary lead also belongs to the same tenant before moving data
      const secondaryLead = await this.prisma.lead.findUnique({ 
        where: { id: secondaryId, tenantId } 
      });
      if (!secondaryLead) continue;

      await this.prisma.call.updateMany({ 
        where: { leadId: secondaryId, tenantId }, 
        data: { leadId: primaryId } 
      });
      await this.prisma.note.updateMany({ 
        where: { leadId: secondaryId, tenantId }, 
        data: { leadId: primaryId } 
      });
      await this.prisma.task.updateMany({ 
        where: { leadId: secondaryId, tenantId }, 
        data: { leadId: primaryId } 
      });
      await this.prisma.deal.updateMany({ 
        where: { leadId: secondaryId, tenantId }, 
        data: { leadId: primaryId } 
      });
      
      // 2. Soft delete the secondary lead
      await this.prisma.lead.update({
        where: { id: secondaryId, tenantId },
        data: { deletedAt: new Date(), customFields: { mergedInto: primaryId } }
      });
    }

    return primaryLead;
  }
}
