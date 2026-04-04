import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBusinessHoursDto } from './dto/create-business-hours.dto';
import { UpdateBusinessHoursDto } from './dto/update-business-hours.dto';

@Injectable()
export class BusinessHoursService {
  constructor(private prisma: PrismaService) {}

  async create(createBusinessHoursDto: CreateBusinessHoursDto) {
    const { slots, holidays, ...data } = createBusinessHoursDto;

    // Default 7 days if no slots provided
    const defaultSlots = Array.from({ length: 7 }).map((_, i) => ({
      dayOfWeek: i,
      isWorkingDay: i >= 1 && i <= 5, // Mon-Fri
      openTime: '09:00',
      closeTime: '17:00',
    }));

    return this.prisma.businessHours.create({
      data: {
        ...data,
        slots: {
          create: slots && slots.length > 0 ? slots : defaultSlots,
        },
        ...(holidays && holidays.length > 0 ? { holidays: { create: holidays.map(h => ({ ...h, date: new Date(h.date) })) } } : {}),
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
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const businessHours = await this.prisma.businessHours.findUnique({
      where: { id },
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

  async update(id: string, updateBusinessHoursDto: UpdateBusinessHoursDto) {
    const { slots, holidays, ...data } = updateBusinessHoursDto;

    // For simplistic update, we first delete existing slots/holidays 
    // if new ones are provided. In a real scenario, you'd sync them.
    if (slots) {
      await this.prisma.businessHourSlot.deleteMany({ where: { businessHoursId: id } });
    }
    if (holidays) {
      await this.prisma.holiday.deleteMany({ where: { businessHoursId: id } });
    }

    return this.prisma.businessHours.update({
      where: { id },
      data: {
        ...data,
        ...(slots ? { slots: { create: slots } } : {}),
        ...(holidays ? { holidays: { create: holidays.map(h => ({ ...h, date: new Date(h.date) })) } } : {}),
      },
      include: {
        slots: true,
        holidays: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.businessHours.delete({
      where: { id },
    });
  }
}
