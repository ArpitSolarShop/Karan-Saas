import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AssignmentPolicyService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; method?: any; entityType?: string; priority?: number; conditions?: any; tenantId: string }) {
    return this.prisma.assignmentPolicy.create({ data });
  }

  async findAll(tenantId: string) {
    return this.prisma.assignmentPolicy.findMany({ where: { tenantId }, orderBy: { priority: 'asc' } });
  }

  async findOne(id: string) {
    return this.prisma.assignmentPolicy.findUnique({ where: { id } });
  }

  async update(id: string, data: any) {
    return this.prisma.assignmentPolicy.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.assignmentPolicy.delete({ where: { id } });
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
