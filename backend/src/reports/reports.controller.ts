import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';
import { Controller, Get, Query, Res, UseGuards, Req } from '@nestjs/common';
import type { Response } from 'express';
import { ReportsService } from './reports.service';
import { MonitoringService } from './monitoring.service';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('reports')
export class ReportsController {
  constructor(
    private service: ReportsService,
    private monitoring: MonitoringService,
  ) {}

  @Get('agent-performance')
  agentPerformance(
    @Query('agentId') agentId: string,
    @Query('from') dateFrom: string,
    @Query('to') dateTo: string,
    @Req() req: any,
  ) {
    return this.service.agentPerformance(req.user.tenantId, agentId, dateFrom, dateTo);
  }

  @Get('campaign')
  campaignReport(@Query('campaignId') campaignId: string, @Req() req: any) {
    return this.service.campaignReport(req.user.tenantId, campaignId);
  }

  @Get('lead-funnel')
  leadFunnel(@Req() req: any) {
    return this.service.leadFunnel(req.user.tenantId);
  }

  @Get('source-analysis')
  sourceAnalysis(@Req() req: any) {
    return this.service.sourceAnalysis(req.user.tenantId);
  }

  @Get('daily-call-volume')
  dailyCallVolume(@Query('days') days: string, @Req() req: any) {
    return this.service.dailyCallVolume(req.user.tenantId, Number(days) || 30);
  }

  @Get('disposition')
  dispositionReport(
    @Query('campaignId') campaignId: string,
    @Query('from') dateFrom: string,
    @Query('to') dateTo: string,
    @Req() req: any,
  ) {
    return this.service.dispositionReport(req.user.tenantId, campaignId, dateFrom, dateTo);
  }

  @Get('hourly')
  hourlyBreakdown(
    @Query('from') dateFrom: string,
    @Query('to') dateTo: string,
    @Req() req: any,
  ) {
    return this.service.hourlyBreakdown(req.user.tenantId, dateFrom, dateTo);
  }

  @Get('missed-calls')
  missedCalls(
    @Query('agentId') agentId: string,
    @Query('from') dateFrom: string,
    @Query('to') dateTo: string,
    @Req() req: any,
  ) {
    return this.service.missedCallsReport(req.user.tenantId, agentId, dateFrom, dateTo);
  }

  @Get('export/calls')
  async exportCalls(
    @Res() res: Response,
    @Query('from') dateFrom: string,
    @Query('to') dateTo: string,
    @Query('agentId') agentId: string,
    @Req() req: any,
  ) {
    const csv = await this.service.exportCallsCsv(req.user.tenantId, dateFrom, dateTo, agentId);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="calls-${Date.now()}.csv"`,
    );
    res.send(csv);
  }

  @Get('live-wallboard')
  liveWallboard(@Req() req: any) {
    return this.monitoring.getLiveWallboard(req.user.tenantId);
  }

  @Get('ai-forecast')
  aiForecast(@Req() req: any) {
    return this.service.generateAIStoreForecast(req.user.tenantId);
  }
}
