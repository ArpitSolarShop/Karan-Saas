import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId?: string, startDate?: string, endDate?: string) {
    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    
    if (startDate && endDate) {
      where.startDatetime = { gte: new Date(startDate) };
      where.endDatetime = { lte: new Date(endDate) };
    }

    return this.prisma.calendarEvent.findMany({
      where,
      include: {
        attendees: true,
      },
      orderBy: { startDatetime: 'asc' },
    });
  }

  async findOne(id: string) {
    const event = await this.prisma.calendarEvent.findUnique({
      where: { id },
      include: { attendees: true },
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async create(data: any) {
    return this.prisma.calendarEvent.create({
      data: {
        tenantId: data.tenantId,
        userId: data.userId,
        title: data.title,
        description: data.description,
        startDatetime: new Date(data.startDatetime),
        endDatetime: new Date(data.endDatetime),
        allDay: data.allDay || false,
        location: data.location,
        eventType: data.eventType || 'MEETING',
        color: data.color || '#3b82f6',
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.calendarEvent.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.calendarEvent.delete({
      where: { id },
    });
  }
}
