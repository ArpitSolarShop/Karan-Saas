import { Injectable, NotFoundException } from '@nestjs/common';
import { DayOfWeek } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBusinessHoursDto } from './dto/create-business-hours.dto';
import { UpdateBusinessHoursDto } from './dto/update-business-hours.dto';

const DAY_MAP: DayOfWeek[] = [
  DayOfWeek.SUNDAY, DayOfWeek.MONDAY, DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY,
];

@Injectable()
export class BusinessHoursService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, createBusinessHoursDto: CreateBusinessHoursDto) {
    const { slots, holidays, ...data } = createBusinessHoursDto;

    // Default 7 days if no slots provided
    const defaultSlots = Array.from({ length: 7 }).map((_, i) => ({
      dayOfWeek: DAY_MAP[i],
      isClosed: !(i >= 1 && i <= 5), // Mon-Fri are open
      openTime: '09:00',
      closeTime: '17:00',
    }));

    const mappedSlots = slots && slots.length > 0
      ? slots.map(s => ({ dayOfWeek: DAY_MAP[s.dayOfWeek] || DayOfWeek.MONDAY, openTime: s.openTime, closeTime: s.closeTime, isClosed: !s.isWorkingDay }))
      : defaultSlots;

    return this.prisma.businessHours.create({
      data: {
        ...data,
        tenantId,
        slots: {
          create: mappedSlots,
        },
        ...(holidays && holidays.length > 0 ? { holidays: { create: holidays.map(h => ({ name: h.name, date: new Date(h.date), isRecurring: h.isRecurringAnnually ?? false })) } } : {}),
      },
      include: {
        slots: true,
        holidays: true,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.businessHours.findMany({
      where: { tenantId },
      include: {
        slots: true,
        holidays: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const businessHours = await this.prisma.businessHours.findFirst({
      where: { id, tenantId },
      include: {
        slots: true,
        holidays: true,
      },
    });

    if (!businessHours) {
      throw new NotFoundException(`BusinessHours with ID ${id} not found`);
    }

    return businessHours;
  }

  async update(id: string, tenantId: string, updateBusinessHoursDto: UpdateBusinessHoursDto) {
    const { slots, holidays, tenantId: _tenantId, ...data } = updateBusinessHoursDto;

    // Verify ownership
    await this.findOne(id, tenantId);

    // For simplistic update, we first delete existing slots/holidays 
    if (slots) {
      await this.prisma.businessHourSlot.deleteMany({ where: { businessHoursId: id } });
    }
    if (holidays) {
      await this.prisma.holiday.deleteMany({ where: { businessHoursId: id } });
    }

    return this.prisma.businessHours.update({
      where: { id, tenantId },
      data: {
        ...data,
        ...(slots ? { slots: { create: slots.map(s => ({ dayOfWeek: s.dayOfWeek as any, openTime: s.openTime, closeTime: s.closeTime, isClosed: !s.isWorkingDay })) } } : {}),
        ...(holidays ? { holidays: { create: holidays.map(h => ({ name: h.name, date: new Date(h.date), isRecurring: h.isRecurringAnnually ?? false })) } } : {}),
      },
      include: {
        slots: true,
        holidays: true,
      },
    });
  }

  async remove(id: string, tenantId: string) {
    return this.prisma.businessHours.delete({
      where: { id, tenantId },
    });
  }
}
