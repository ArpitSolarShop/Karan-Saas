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

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: { registrations: { include: { lead: { select: { firstName: true, lastName: true, email: true } } } } },
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async create(data: any) {
    return this.prisma.event.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.event.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.event.delete({ where: { id } });
  }

  // Registration
  async register(eventId: string, data: any) {
    return this.prisma.eventRegistration.create({
      data: { ...data, eventId },
    });
  }

  async cancelRegistration(id: string) {
    return this.prisma.eventRegistration.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }
}
