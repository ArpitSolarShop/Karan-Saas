import { Controller, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';
import { DialerService } from './dialer.service';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('dialer')
export class DialerController {
  constructor(private readonly dialerService: DialerService) {}

  @Post('next-lead')
  getNextLead(@Req() req: any, @Body() body: { campaignId: string; agentId: string }) {
    return this.dialerService.getNextLead(req.user.tenantId, body.campaignId, body.agentId);
  }

  @Post('start-call')
  startCall(@Req() req: any, @Body() body: { leadId: string; agentId: string }) {
    return this.dialerService.startCall(req.user.tenantId, body.leadId, body.agentId);
  }

  @Post('end-call/:id')
  endCall(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { dispositionId: string; notes?: string },
  ) {
    return this.dialerService.endCall(req.user.tenantId, id, body.dispositionId, body.notes);
  }
}
