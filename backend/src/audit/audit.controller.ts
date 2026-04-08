import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('audit')
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('recent')
  async getRecent(@Query('tenantId') tenantId: string) {
    return this.auditService.getRecent(tenantId || 'dev-tenant-001');
  }
}
