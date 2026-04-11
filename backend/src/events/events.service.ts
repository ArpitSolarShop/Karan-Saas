import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.event.findMany({
      where: { tenantId },
      include: { registrations: true, _count: { select: { registrations: true } } },
      orderBy: { startDate: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const event = await this.prisma.event.findFirst({
      where: { id, tenantId },
      include: { registrations: { include: { lead: { select: { firstName: true, lastName: true, email: true } } } } },
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async create(tenantId: string, data: any) {
    return this.prisma.event.create({ data: { ...data, tenantId } });
  }

  async update(tenantId: string, id: string, data: any) {
    return this.prisma.event.update({ where: { id, tenantId }, data });
  }

  async remove(tenantId: string, id: string) {
    return this.prisma.event.delete({ where: { id, tenantId } });
  }

  // Registration
  async register(tenantId: string, eventId: string, data: any) {
    return this.prisma.eventRegistration.create({
      data: { ...data, eventId, tenantId },
    });
  }

  async cancelRegistration(tenantId: string, id: string) {
    return this.prisma.eventRegistration.update({
      where: { id, tenantId },
      data: { status: 'CANCELLED' },
    });
  }
}
