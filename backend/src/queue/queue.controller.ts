import { Controller, Get, UseGuards } from '@nestjs/common';
import { QueueService } from './queue.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  /**
   * GET /jobs/status — returns BullMQ queue depth for all 6 queues.
   * Used by CampaignDialerControl to show live waiting/active/done/failed counts.
   */
  @Get('status')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER', 'SUPERVISOR')
  async getStatus() {
    return this.queueService.getQueueStats();
  }
}
