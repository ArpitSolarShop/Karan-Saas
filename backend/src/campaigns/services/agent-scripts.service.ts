import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AgentScriptsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, data: { name: string; description?: string; nodes?: any; createdBy?: string }) {
    return this.prisma.agentScript.create({ data: { ...data, tenantId } });
  }

  async findAll(tenantId: string) {
    return this.prisma.agentScript.findMany({ where: { tenantId }, orderBy: { updatedAt: 'desc' } });
  }

  async findOne(tenantId: string, id: string) {
      const script = await this.prisma.agentScript.findFirst({ where: { id, tenantId } });
      if (!script) throw new NotFoundException(`Script ${id} not found`);
      return script;
  }

  async update(tenantId: string, id: string, data: any) {
      return this.prisma.agentScript.update({ where: { id, tenantId }, data: { ...data, version: { increment: 1 } } });
  }

  async remove(tenantId: string, id: string) {
      return this.prisma.agentScript.delete({ where: { id, tenantId } });
  }

  async duplicate(tenantId: string, id: string) {
    const original = await this.findOne(tenantId, id);
    return this.prisma.agentScript.create({
      data: {
        name: `${original.name} (Copy)`,
        description: original.description,
        nodes: original.nodes as any,
        tenantId,
        createdBy: original.createdBy,
      },
    });
  }
}
