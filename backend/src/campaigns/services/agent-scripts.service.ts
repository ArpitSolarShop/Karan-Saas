import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AgentScriptsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; description?: string; nodes?: any; tenantId: string; createdBy?: string }) {
    return this.prisma.agentScript.create({ data });
  }

  async findAll(tenantId: string) {
    return this.prisma.agentScript.findMany({ where: { tenantId }, orderBy: { updatedAt: 'desc' } });
  }

  async findOne(id: string) {
    const script = await this.prisma.agentScript.findUnique({ where: { id } });
    if (!script) throw new NotFoundException(`Script ${id} not found`);
    return script;
  }

  async update(id: string, data: any) {
    return this.prisma.agentScript.update({ where: { id }, data: { ...data, version: { increment: 1 } } });
  }

  async remove(id: string) {
    return this.prisma.agentScript.delete({ where: { id } });
  }

  async duplicate(id: string) {
    const original = await this.findOne(id);
    return this.prisma.agentScript.create({
      data: {
        name: `${original.name} (Copy)`, description: original.description,
        nodes: original.nodes as any, tenantId: original.tenantId, createdBy: original.createdBy,
      },
    });
  }
}
