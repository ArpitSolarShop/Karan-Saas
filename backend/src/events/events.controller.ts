import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  create(@Body() dto: any) { return this.eventsService.create(dto); }

  @Get()
  findAll(@Query('tenantId') tenantId: string) { return this.eventsService.findAll(tenantId); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.eventsService.findOne(id); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any) { return this.eventsService.update(id, dto); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.eventsService.remove(id); }

  @Post(':id/register')
  register(@Param('id') id: string, @Body() dto: any) { return this.eventsService.register(id, dto); }

  @Patch('registrations/:rid/cancel')
  cancelRegistration(@Param('rid') rid: string) { return this.eventsService.cancelRegistration(rid); }
}
