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

  async findByUser(userId: string, tenantId: string) {
    return this.prisma.leaveRequest.findMany({
      where: { userId, tenantId },
      orderBy: { startDate: 'desc' },
    });
  }

  async create(tenantId: string, data: any) {
    return this.prisma.leaveRequest.create({ 
      data: { ...data, tenantId } 
    });
  }

  async approve(id: string, tenantId: string) {
    const leave = await this.prisma.leaveRequest.findFirst({ where: { id, tenantId } });
    if (!leave) throw new NotFoundException('Leave request not found');
    return this.prisma.leaveRequest.update({
      where: { id, tenantId },
      data: { status: 'APPROVED' },
    });
  }

  async reject(id: string, tenantId: string, reason?: string) {
    const leave = await this.prisma.leaveRequest.findFirst({ where: { id, tenantId } });
    if (!leave) throw new NotFoundException('Leave request not found');
    return this.prisma.leaveRequest.update({
      where: { id, tenantId },
      data: { status: 'REJECTED', reviewNotes: reason },
    });
  }

  async remove(id: string, tenantId: string) {
    return this.prisma.leaveRequest.delete({ 
      where: { id, tenantId } 
    });
  }
}
