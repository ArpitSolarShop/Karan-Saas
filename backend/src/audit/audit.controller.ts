import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';
import { Req } from '@nestjs/common';

@Controller('audit')
@UseGuards(JwtAuthGuard, TenantGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('recent')
  async getRecent(@Req() req: any) {
    return this.auditService.getRecent(req.user.tenantId);
  }
}
