import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto';

@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, startDate?: string, endDate?: string) {
    const where: any = { tenantId };
    
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

  async findOne(id: string, tenantId: string) {
    const event = await this.prisma.calendarEvent.findFirst({
      where: { id, tenantId },
      include: { attendees: true },
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async create(tenantId: string, createCalendarEventDto: CreateCalendarEventDto) {
    const { attendees, ...eventData } = createCalendarEventDto;

    return this.prisma.calendarEvent.create({
      data: {
        ...eventData,
        tenantId,
        startDatetime: new Date(eventData.startDatetime),
        endDatetime: new Date(eventData.endDatetime),
        ...(attendees && attendees.length > 0
          ? {
              attendees: {
                create: attendees,
              },
            }
          : {}),
      },
      include: {
        attendees: true,
      },
    });
  }

  async update(id: string, tenantId: string, updateCalendarEventDto: UpdateCalendarEventDto) {
    const { attendees, startDatetime, endDatetime, userId, ...eventData } = updateCalendarEventDto as any;

    return this.prisma.calendarEvent.update({
      where: { id, tenantId },
      data: {
        ...eventData,
        ...(startDatetime && { startDatetime: new Date(startDatetime) }),
        ...(endDatetime && { endDatetime: new Date(endDatetime) }),
      },
    });
  }

  async remove(id: string, tenantId: string) {
    return this.prisma.calendarEvent.delete({
      where: { id, tenantId },
    });
  }
}
