import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ExtensionsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    number: string; name: string; type?: any; password: string;
    callerIdName?: string; callerIdNum?: string; userId?: string;
    voicemailEnabled?: boolean; callRecording?: boolean; tenantId: string;
  }) {
    return this.prisma.extension.create({
      data: {
        number: data.number,
        name: data.name,
        type: data.type || 'SIP',
        password: data.password,
        callerIdName: data.callerIdName,
        callerIdNum: data.callerIdNum,
        userId: data.userId,
        voicemailEnabled: data.voicemailEnabled ?? false,
        callRecording: data.callRecording ?? false,
        tenantId: data.tenantId,
      },
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.extension.findMany({
      where: { tenantId },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, agentStatus: true } },
        queueMembers: { include: { queue: { select: { name: true } } } },
      },
      orderBy: { number: 'asc' },
    });
  }

  async findOne(id: string) {
    const ext = await this.prisma.extension.findUnique({
      where: { id },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        queueMembers: { include: { queue: true } },
        ringGroupMembers: { include: { ringGroup: true } },
      },
    });
    if (!ext) throw new NotFoundException(`Extension ${id} not found`);
    return ext;
  }

  async update(id: string, data: any) {
    return this.prisma.extension.update({
      where: { id },
      data,
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
    });
  }

  async remove(id: string) {
    return this.prisma.extension.delete({ where: { id } });
  }

  async getStats(tenantId: string) {
    const [total, active, webrtc, withVoicemail] = await Promise.all([
      this.prisma.extension.count({ where: { tenantId } }),
      this.prisma.extension.count({ where: { tenantId, isActive: true } }),
      this.prisma.extension.count({ where: { tenantId, type: 'WEBRTC' } }),
      this.prisma.extension.count({ where: { tenantId, voicemailEnabled: true } }),
    ]);
    return { total, active, webrtc, withVoicemail };
  }
}
