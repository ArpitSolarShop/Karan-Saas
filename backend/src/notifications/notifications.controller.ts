import {
  UseGuards,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { Req } from '@nestjs/common';
import { TenantGuard } from '../auth/tenant.guard';

@Controller()
@UseGuards(JwtAuthGuard, TenantGuard)
export class NotificationsController {
  constructor(private service: NotificationsService) {}

  // ── Notifications ───────────────────────────────────────────────────────────
  @Get('notifications')
  findAll(@Req() req: any, @Query('recipientId') recipientId?: string) {
    return this.service.findAll(req.user.tenantId, recipientId);
  }

  @Get('notifications/unread')
  findUnread(@Req() req: any, @Query('recipientId') userId?: string) {
    return this.service.findUnread(req.user.tenantId, userId || req.user.id);
  }

  @Post('notifications')
  create(@Body() body: any, @Req() req: any) {
    return this.service.create({ ...body, tenantId: req.user.tenantId });
  }

  @Patch('notifications/:id/read')
  markRead(@Param('id') id: string, @Req() req: any) {
    return this.service.markRead(id, req.user.tenantId);
  }

  @Post('notifications/mark-all-read')
  markAllRead(@Body('recipientId') recipientId: string, @Req() req: any) {
    return this.service.markAllRead(req.user.tenantId, recipientId || req.user.id);
  }

  // ── Suppressions (DNC) ───────────────────────────────────────────────────────
  @Get('notifications/suppressions')
  findAllSuppressions(@Req() req: any) {
    return this.service.findAllSuppressions(req.user.tenantId);
  }

  @Post('notifications/suppressions')
  addSuppression(@Body() body: any, @Req() req: any) {
    return this.service.addSuppression({ ...body, tenantId: req.user.tenantId });
  }

  @Get('notifications/dnc-check')
  checkDnc(@Query('phone') phone: string, @Req() req: any) {
    return this.service.checkDnc(req.user.tenantId, phone);
  }

  @Delete('notifications/suppressions/:id')
  removeSuppression(@Param('id') id: string, @Req() req: any) {
    return this.service.removeSuppression(id, req.user.tenantId);
  }

  // ── Audit Logs ───────────────────────────────────────────────────────────────
  @Get('audit-logs')
  getAuditTrail(
    @Req() req: any,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
  ) {
    return this.service.getAuditTrail(req.user.tenantId, entityType, entityId);
  }

  @Post('audit-logs')
  logAction(@Body() body: any, @Req() req: any) {
    return this.service.logAction({ ...body, tenantId: req.user.tenantId });
  }
}
