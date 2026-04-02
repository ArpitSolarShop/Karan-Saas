import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HrLeavesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.leaveRequest.findMany({
      where: { tenantId },
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.leaveRequest.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' },
    });
  }

  async create(data: any) {
    return this.prisma.leaveRequest.create({ data });
  }

  async approve(id: string) {
    const leave = await this.prisma.leaveRequest.findUnique({ where: { id } });
    if (!leave) throw new NotFoundException('Leave request not found');
    return this.prisma.leaveRequest.update({
      where: { id },
      data: { status: 'APPROVED' },
    });
  }

  async reject(id: string, reason?: string) {
    const leave = await this.prisma.leaveRequest.findUnique({ where: { id } });
    if (!leave) throw new NotFoundException('Leave request not found');
    return this.prisma.leaveRequest.update({
      where: { id },
      data: { status: 'REJECTED', reviewNotes: reason },
    });
  }

  async remove(id: string) {
    return this.prisma.leaveRequest.delete({ where: { id } });
  }
}
