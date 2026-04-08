import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AcdQueuesService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string; strategy?: any; timeout?: number; wrapUpTime?: number;
    maxWaitTime?: number; maxCallers?: number; serviceLevelSec?: number;
    tenantId: string;
  }) {
    return this.prisma.acdQueue.create({
      data: {
        name: data.name, strategy: data.strategy ?? 'RING_ALL',
        timeout: data.timeout ?? 30, wrapUpTime: data.wrapUpTime ?? 15,
        maxWaitTime: data.maxWaitTime ?? 300, maxCallers: data.maxCallers ?? 0,
        serviceLevelSec: data.serviceLevelSec ?? 60, tenantId: data.tenantId,
      },
      include: { members: { include: { extension: true } }, skills: { include: { skill: true } } },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.acdQueue.findMany({
      where: { tenantId },
      include: {
        members: { include: { extension: { select: { number: true, name: true, userId: true } } } },
        skills: { include: { skill: true } },
        _count: { select: { members: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const queue = await this.prisma.acdQueue.findUnique({
      where: { id },
      include: {
        members: { include: { extension: { include: { user: { select: { firstName: true, lastName: true, agentStatus: true } } } } } },
        skills: { include: { skill: true } },
      },
    });
    if (!queue) throw new NotFoundException(`Queue ${id} not found`);
    return queue;
  }

  async update(id: string, data: any) {
    return this.prisma.acdQueue.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.acdQueue.delete({ where: { id } });
  }

  // Member management
  async addMember(queueId: string, extensionId: string, penalty = 0) {
    return this.prisma.queueMember.create({
      data: { queueId, extensionId, penalty },
      include: { extension: true },
    });
  }

  async removeMember(queueId: string, extensionId: string) {
    return this.prisma.queueMember.delete({
      where: { queueId_extensionId: { queueId, extensionId } },
    });
  }

  async toggleMemberPause(queueId: string, extensionId: string, paused: boolean) {
    return this.prisma.queueMember.update({
      where: { queueId_extensionId: { queueId, extensionId } },
      data: { paused },
    });
  }

  // Skill management for queue
  async addSkill(queueId: string, skillId: string) {
    return this.prisma.queueSkill.create({ data: { queueId, skillId } });
  }

  async removeSkill(queueId: string, skillId: string) {
    return this.prisma.queueSkill.delete({
      where: { queueId_skillId: { queueId, skillId } },
    });
  }

  async getStats(tenantId: string) {
    const queues = await this.prisma.acdQueue.findMany({
      where: { tenantId, isActive: true },
      include: { _count: { select: { members: true } } },
    });
    return queues.map(q => ({
      id: q.id, name: q.name, strategy: q.strategy,
      memberCount: q._count.members, serviceLevelSec: q.serviceLevelSec,
    }));
  }
}
