import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: any) { return this.eventsService.create(req.user.tenantId, dto); }

  @Get()
  findAll(@Req() req: any) { return this.eventsService.findAll(req.user.tenantId); }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) { return this.eventsService.findOne(req.user.tenantId, id); }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: any) { return this.eventsService.update(req.user.tenantId, id, dto); }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) { return this.eventsService.remove(req.user.tenantId, id); }

  @Post(':id/register')
  register(@Req() req: any, @Param('id') id: string, @Body() dto: any) { return this.eventsService.register(req.user.tenantId, id, dto); }

  @Patch('registrations/:rid/cancel')
  cancelRegistration(@Req() req: any, @Param('rid') rid: string) { return this.eventsService.cancelRegistration(req.user.tenantId, rid); }
}
