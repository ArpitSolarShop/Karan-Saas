import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AssignmentPolicyService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, data: { name: string; method?: any; entityType?: string; priority?: number; conditions?: any; tenantId: string }) {
    return this.prisma.assignmentPolicy.create({ data });
  }

  async findAll(tenantId: string) {
    return this.prisma.assignmentPolicy.findMany({ where: { tenantId }, orderBy: { priority: 'asc' } });
  }

  async findOne(tenantId: string, id: string) {
      return this.prisma.assignmentPolicy.findFirst({ where: { id, tenantId } });
  }

  async update(tenantId: string, id: string, data: any) {
      return this.prisma.assignmentPolicy.update({ where: { id, tenantId }, data });
  }

  async remove(tenantId: string, id: string) {
      return this.prisma.assignmentPolicy.delete({ where: { id, tenantId } });
  }

  // Core assignment logic
  async getNextAgent(tenantId: string, method: string = 'ROUND_ROBIN'): Promise<string | null> {
    const availableAgents = await this.prisma.user.findMany({
      where: { tenantId, agentStatus: 'AVAILABLE', isActive: true, role: { in: ['AGENT', 'TEAM_LEAD'] } },
      select: { id: true, firstName: true, lastName: true },
    });
    if (availableAgents.length === 0) return null;

    switch (method) {
      case 'RANDOM':
        return availableAgents[Math.floor(Math.random() * availableAgents.length)].id;
      case 'ROUND_ROBIN':
      default:
        return availableAgents[0].id; // Simplified — production would track last assigned
    }
  }
}
