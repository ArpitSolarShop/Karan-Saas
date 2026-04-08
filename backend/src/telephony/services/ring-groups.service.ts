import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RingGroupsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; number: string; strategy?: any; ringTime?: number; tenantId: string }) {
    return this.prisma.ringGroup.create({
      data: { name: data.name, number: data.number, strategy: data.strategy ?? 'RING_ALL', ringTime: data.ringTime ?? 20, tenantId: data.tenantId },
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

  async findOne(id: string) {
    const rg = await this.prisma.ringGroup.findUnique({
      where: { id }, include: { members: { include: { extension: true } } },
    });
    if (!rg) throw new NotFoundException(`Ring Group ${id} not found`);
    return rg;
  }

  async update(id: string, data: any) {
    return this.prisma.ringGroup.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.ringGroup.delete({ where: { id } });
  }

  async addMember(ringGroupId: string, extensionId: string) {
    return this.prisma.ringGroupMember.create({ data: { ringGroupId, extensionId }, include: { extension: true } });
  }

  async removeMember(ringGroupId: string, extensionId: string) {
    return this.prisma.ringGroupMember.delete({ where: { ringGroupId_extensionId: { ringGroupId, extensionId } } });
  }
}
