import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto';

import { UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';

@Controller('calendar')
@UseGuards(JwtAuthGuard, TenantGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post()
  create(@Req() req: any, @Body() createEventDto: CreateCalendarEventDto) {
    return this.calendarService.create(req.user.tenantId, createEventDto);
  }

  @Get()
  findAll(
    @Req() req: any,
    @Query('start') start?: string,
    @Query('end') end?: string
  ) {
    return this.calendarService.findAll(req.user.tenantId, start, end);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.calendarService.findOne(id, req.user.tenantId);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() updateEventDto: UpdateCalendarEventDto) {
    return this.calendarService.update(id, req.user.tenantId, updateEventDto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.calendarService.remove(id, req.user.tenantId);
  }
}
