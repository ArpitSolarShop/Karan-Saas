import { Controller, Get, Param, Query, UseGuards, Req } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';

@Controller('gamification')
@UseGuards(JwtAuthGuard, TenantGuard)
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('leaderboard')
  getLeaderboard(@Req() req: any, @Query('limit') limit?: string) {
    return this.gamificationService.getLeaderboard(
      req.user.tenantId,
      limit ? parseInt(limit) : 10,
    );
  }

  @Get('users/:userId/points')
  getUserPoints(@Param('userId') userId: string) {
    return this.gamificationService.getUserPoints(userId);
  }
}
