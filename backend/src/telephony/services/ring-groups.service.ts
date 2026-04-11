import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RingGroupsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, data: { name: string; number: string; strategy?: any; ringTime?: number }) {
    return this.prisma.ringGroup.create({
      data: { ...data, strategy: data.strategy ?? 'RING_ALL', ringTime: data.ringTime ?? 20, tenantId },
      include: { members: { include: { extension: true } } },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.ringGroup.findMany({
      where: { tenantId },
      include: { members: { include: { extension: { select: { number: true, name: true } } } }, _count: { select: { members: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
      const rg = await this.prisma.ringGroup.findFirst({ where: { id, tenantId }, include: { members: { include: { extension: true } } },
      });
      if (!rg) throw new NotFoundException(`Ring Group ${id} not found`);
      return rg;
  }

  async update(tenantId: string, id: string, data: any) {
      return this.prisma.ringGroup.update({ where: { id, tenantId }, data });
  }

  async remove(tenantId: string, id: string) {
      return this.prisma.ringGroup.delete({ where: { id, tenantId } });
  }

  async addMember(tenantId: string, ringGroupId: string, extensionId: string) {
    return this.prisma.ringGroupMember.create({ data: { ringGroupId, extensionId, tenantId }, include: { extension: true } });
  }

  async removeMember(tenantId: string, ringGroupId: string, extensionId: string) {
    return this.prisma.ringGroupMember.deleteMany({ where: { ringGroupId, extensionId, tenantId } });
  }
}
