import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SipTrunksService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string; host: string; port?: number; username?: string;
    password?: string; transport?: string; codecs?: string[];
    maxChannels?: number; provider?: string; tenantId: string;
  }) {
    return this.prisma.sipTrunk.create({
      data: {
        name: data.name, host: data.host, port: data.port ?? 5060,
        username: data.username, password: data.password,
        transport: data.transport ?? 'udp', codecs: data.codecs ?? ['ulaw', 'alaw'],
        maxChannels: data.maxChannels ?? 0, provider: data.provider,
        tenantId: data.tenantId,
      },
      include: { outboundRoutes: true },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.sipTrunk.findMany({
      where: { tenantId },
      include: { outboundRoutes: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const trunk = await this.prisma.sipTrunk.findUnique({
      where: { id }, include: { outboundRoutes: true },
    });
    if (!trunk) throw new NotFoundException(`SIP Trunk ${id} not found`);
    return trunk;
  }

  async update(id: string, data: any) {
    return this.prisma.sipTrunk.update({ where: { id }, data, include: { outboundRoutes: true } });
  }

  async remove(id: string) {
    return this.prisma.sipTrunk.delete({ where: { id } });
  }

  // Outbound Routes
  async createRoute(data: { name: string; pattern: string; priority?: number; prefix?: string; trunkId: string; tenantId: string }) {
    return this.prisma.outboundRoute.create({ data });
  }

  async findAllRoutes(tenantId: string) {
    return this.prisma.outboundRoute.findMany({
      where: { tenantId }, include: { trunk: { select: { name: true, host: true } } },
      orderBy: { priority: 'asc' },
    });
  }

  async deleteRoute(id: string) {
    return this.prisma.outboundRoute.delete({ where: { id } });
  }
}
