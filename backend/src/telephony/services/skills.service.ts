import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SkillsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; description?: string; tenantId: string }) {
    return this.prisma.skill.create({ data, include: { agents: true, rules: true } });
  }

  async findAll(tenantId: string) {
    return this.prisma.skill.findMany({
      where: { tenantId },
      include: { _count: { select: { agents: true, queueSkills: true } }, rules: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const skill = await this.prisma.skill.findUnique({
      where: { id },
      include: {
        agents: { include: { agent: { select: { firstName: true, lastName: true, email: true } } } },
        rules: true, queueSkills: { include: { queue: { select: { name: true } } } },
      },
    });
    if (!skill) throw new NotFoundException(`Skill ${id} not found`);
    return skill;
  }

  async update(id: string, data: any) {
    return this.prisma.skill.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.skill.delete({ where: { id } });
  }

  // Agent skill assignment
  async assignToAgent(agentId: string, skillId: string, level = 50) {
    return this.prisma.agentSkill.upsert({
      where: { agentId_skillId: { agentId, skillId } },
      create: { agentId, skillId, level },
      update: { level },
    });
  }

  async removeFromAgent(agentId: string, skillId: string) {
    return this.prisma.agentSkill.delete({
      where: { agentId_skillId: { agentId, skillId } },
    });
  }

  async getAgentSkills(agentId: string) {
    return this.prisma.agentSkill.findMany({
      where: { agentId }, include: { skill: true },
    });
  }

  // Skill rules
  async createRule(data: { name: string; skillId: string; minLevel?: number; timeout?: number }) {
    return this.prisma.skillRule.create({ data });
  }

  async deleteRule(id: string) {
    return this.prisma.skillRule.delete({ where: { id } });
  }
}
