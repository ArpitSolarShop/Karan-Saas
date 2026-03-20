import { Controller, Get, Post, Put, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApprovalsService } from './approvals.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('approvals')
@UseGuards(JwtAuthGuard)
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    return this.approvalsService.createRequest(req.user.tenantId, req.user.id, body);
  }

  @Get('pending')
  async getPending(@Req() req: any) {
    return this.approvalsService.getPendingRequests(req.user.tenantId);
  }

  @Put(':id/resolve')
  async resolve(@Param('id') id: string, @Req() req: any, @Body() body: any) {
    return this.approvalsService.resolveRequest(id, req.user.tenantId, req.user.id, body.status, body.notes);
  }
}
