import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CalendarService } from './calendar.service';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post()
  create(@Body() createEventDto: any) {
    return this.calendarService.create(createEventDto);
  }

  @Get()
  findAll(
    @Query('tenantId') tenantId?: string,
    @Query('start') start?: string,
    @Query('end') end?: string
  ) {
    return this.calendarService.findAll(tenantId, start, end);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.calendarService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventDto: any) {
    return this.calendarService.update(id, updateEventDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.calendarService.remove(id);
  }
}
