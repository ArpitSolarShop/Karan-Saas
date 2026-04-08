import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TimeConditionsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string; matchAction?: string; matchTarget?: string;
    noMatchAction?: string; noMatchTarget?: string; timeRanges?: any; tenantId: string;
  }) {
    return this.prisma.timeCondition.create({ data });
  }

  async findAll(tenantId: string) {
    return this.prisma.timeCondition.findMany({ where: { tenantId }, orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const tc = await this.prisma.timeCondition.findUnique({ where: { id } });
    if (!tc) throw new NotFoundException(`Time Condition ${id} not found`);
    return tc;
  }

  async update(id: string, data: any) {
    return this.prisma.timeCondition.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.timeCondition.delete({ where: { id } });
  }

  // Evaluate a time condition (is current time within any time range?)
  evaluate(timeRanges: any[]): boolean {
    const now = new Date();
    const currentDay = now.getDay();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentMinOfDay = currentHour * 60 + currentMin;

    for (const range of timeRanges) {
      if (range.days?.includes(currentDay)) {
        const [startH, startM] = (range.startTime || '00:00').split(':').map(Number);
        const [endH, endM] = (range.endTime || '23:59').split(':').map(Number);
        const startMinOfDay = startH * 60 + startM;
        const endMinOfDay = endH * 60 + endM;
        if (currentMinOfDay >= startMinOfDay && currentMinOfDay <= endMinOfDay) return true;
      }
    }
    return false;
  }
}
