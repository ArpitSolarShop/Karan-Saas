import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, TenantGuard)
export class AuditLogsController {
  constructor(private readonly service: AuditLogsService) {}

  @Get()
  async getLogs(
    @Query('entityType') entityType: string,
    @Query('entityId') entityId: string,
    @Req() req: any,
  ) {
    const tenantId = req.tenantId || req.user.tenantId;
    return this.service.findByEntity(entityType, entityId, tenantId);
  }
}
