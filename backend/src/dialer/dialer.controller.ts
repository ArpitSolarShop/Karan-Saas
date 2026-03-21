import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Controller, Post, Body, Param } from '@nestjs/common';
import { DialerService } from './dialer.service';

@UseGuards(JwtAuthGuard)
@Controller('dialer')
export class DialerController {
  constructor(private readonly dialerService: DialerService) {}

  @Post('next-lead')
  getNextLead(@Body() body: { campaignId: string; agentId: string }) {
    return this.dialerService.getNextLead(body.campaignId, body.agentId);
  }

  @Post('start-call')
  startCall(@Body() body: { leadId: string; agentId: string }) {
    return this.dialerService.startCall(body.leadId, body.agentId);
  }

  @Post('end-call/:id')
  endCall(
    @Param('id') id: string,
    @Body() body: { dispositionId: string; notes?: string },
  ) {
    return this.dialerService.endCall(id, body.dispositionId, body.notes);
  }
}
