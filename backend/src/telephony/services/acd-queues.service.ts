import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AcdQueuesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, data: {
    name: string; strategy?: any; timeout?: number; wrapUpTime?: number;
    maxWaitTime?: number; maxCallers?: number; serviceLevelSec?: number;
  }) {
    return this.prisma.acdQueue.create({
      data: {
        ...data,
        tenantId,
        strategy: data.strategy ?? 'RING_ALL',
        timeout: data.timeout ?? 30,
        wrapUpTime: data.wrapUpTime ?? 15,
        maxWaitTime: data.maxWaitTime ?? 300,
        maxCallers: data.maxCallers ?? 0,
        serviceLevelSec: data.serviceLevelSec ?? 60,
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

  async findOne(tenantId: string, id: string) {
      const queue = await this.prisma.acdQueue.findFirst({ where: { id, tenantId },
        include: {
          members: { include: { extension: { include: { user: { select: { firstName: true, lastName: true, agentStatus: true } } } } } },
          skills: { include: { skill: true } },
        },
      });
      if (!queue) throw new NotFoundException(`Queue ${id} not found`);
      return queue;
  }

  async update(tenantId: string, id: string, data: any) {
      return this.prisma.acdQueue.update({ where: { id, tenantId }, data });
  }

  async remove(tenantId: string, id: string) {
      return this.prisma.acdQueue.delete({ where: { id, tenantId } });
  }

  // Member management
  async addMember(tenantId: string, queueId: string, extensionId: string, penalty = 0) {
    return this.prisma.queueMember.create({
      data: { queueId, extensionId, penalty, tenantId },
      include: { extension: true },
    });
  }

  async removeMember(tenantId: string, queueId: string, extensionId: string) {
    return this.prisma.queueMember.deleteMany({
      where: { queueId, extensionId, tenantId },
    });
  }

  async toggleMemberPause(tenantId: string, queueId: string, extensionId: string, paused: boolean) {
    return this.prisma.queueMember.updateMany({
      where: { queueId, extensionId, tenantId },
      data: { paused },
    });
  }

  // Skill management for queue
  async addSkill(tenantId: string, queueId: string, skillId: string) {
    return this.prisma.queueSkill.create({ data: { queueId, skillId, tenantId } });
  }

  async removeSkill(tenantId: string, queueId: string, skillId: string) {
    return this.prisma.queueSkill.deleteMany({
      where: { queueId, skillId, tenantId },
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
