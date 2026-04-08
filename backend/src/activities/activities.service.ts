import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  async log(
    tenantId: string,
    leadId: string,
    userId: string,
    activityType: string,
    description: string,
  ) {
    return this.prisma.activity.create({
      data: {
        tenantId,
        leadId,
        userId,
        activityType,
        description,
      },
    });
  }

  async findByLead(leadId: string, tenantId: string) {
    return this.prisma.activity.findMany({
      where: { leadId, tenantId },
      include: { user: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.activity.findMany({
      where: { tenantId },
      include: {
        lead: { select: { name: true } },
        user: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
