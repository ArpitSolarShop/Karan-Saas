import { UseGuards, Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private service: NotificationsService) {}

  // ── Notifications ───────────────────────────────────────────────────────────
  @Get('notifications')
  findAll(@Query('recipientId') recipientId?: string) { return this.service.findAll(recipientId); }

  @Get('notifications/unread')
  findUnread(@Query('recipientId') userId?: string) { return this.service.findUnread(userId || 'all'); }

  @Post('notifications')
  create(@Body() body: any) { return this.service.create(body); }

  @Patch('notifications/:id/read')
  markRead(@Param('id') id: string) { return this.service.markRead(id); }

  @Post('notifications/mark-all-read')
  markAllRead(@Body('recipientId') recipientId?: string) { return this.service.markAllRead(recipientId || ''); }

  // ── Suppressions (DNC) ───────────────────────────────────────────────────────
  @Get('notifications/suppressions')
  findAllSuppressions(@Query('tenantId') tenantId?: string) { return this.service.findAllSuppressions(tenantId); }

  @Post('notifications/suppressions')
  addSuppression(@Body() body: any) { return this.service.addSuppression(body); }

  @Get('notifications/dnc-check')
  checkDnc(@Query('phone') phone: string) { return this.service.checkDnc(phone); }

  @Delete('notifications/suppressions/:id')
  removeSuppression(@Param('id') id: string) { return this.service.removeSuppression(id); }

  // ── Audit Logs ───────────────────────────────────────────────────────────────
  @Get('audit-logs')
  getAuditTrail(@Query('entityType') entityType?: string, @Query('entityId') entityId?: string) {
    return this.service.getAuditTrail(entityType, entityId);
  }

  @Post('audit-logs')
  logAction(@Body() body: any) { return this.service.logAction(body); }
}
