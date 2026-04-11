import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AgentCapacityService {
  constructor(private prisma: PrismaService) {}

  async getCapacity(tenantId: string, agentId: string) {
    return this.prisma.agentCapacity.findUnique({ where: { agentId }, include: { agent: { select: { firstName: true, lastName: true } } } });
  }

  async upsertCapacity(agentId: string, tenantId: string, data: {
    maxConcurrentChats?: number; maxConcurrentCalls?: number; maxConcurrentEmails?: number;
    autoAcceptCalls?: boolean; autoAcceptChats?: boolean;
  }) {
    return this.prisma.agentCapacity.upsert({
      where: { agentId },
      create: { agentId, tenantId, ...data },
      update: data,
    });
  }

  async getAllCapacities(tenantId: string) {
    return this.prisma.agentCapacity.findMany({
      where: { tenantId },
      include: { agent: { select: { firstName: true, lastName: true, email: true, agentStatus: true } } },
    });
  }

  async remove(tenantId: string, agentId: string) {
    return this.prisma.agentCapacity.delete({ where: { agentId } });
  }
}
