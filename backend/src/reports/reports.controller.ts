import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ReportsService } from './reports.service';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private service: ReportsService) {}

  @Get('agent-performance')
  agentPerformance(
    @Query('agentId') agentId?: string,
    @Query('from') dateFrom?: string,
    @Query('to') dateTo?: string,
  ) {
    return this.service.agentPerformance(agentId, dateFrom, dateTo);
  }

  @Get('campaign')
  campaignReport(@Query('campaignId') campaignId?: string) {
    return this.service.campaignReport(campaignId);
  }

  @Get('lead-funnel')
  leadFunnel() {
    return this.service.leadFunnel();
  }

  @Get('source-analysis')
  sourceAnalysis() {
    return this.service.sourceAnalysis();
  }

  @Get('daily-call-volume')
  dailyCallVolume(@Query('days') days?: string) {
    return this.service.dailyCallVolume(Number(days) || 30);
  }

  @Get('disposition')
  dispositionReport(
    @Query('campaignId') campaignId?: string,
    @Query('from') dateFrom?: string,
    @Query('to') dateTo?: string,
  ) {
    return this.service.dispositionReport(campaignId, dateFrom, dateTo);
  }

  @Get('hourly')
  hourlyBreakdown(
    @Query('from') dateFrom?: string,
    @Query('to') dateTo?: string,
  ) {
    return this.service.hourlyBreakdown(dateFrom, dateTo);
  }

  @Get('missed-calls')
  missedCalls(
    @Query('agentId') agentId?: string,
    @Query('from') dateFrom?: string,
    @Query('to') dateTo?: string,
  ) {
    return this.service.missedCallsReport(agentId, dateFrom, dateTo);
  }

  @Get('export/calls')
  async exportCalls(
    @Res() res: Response,
    @Query('from') dateFrom?: string,
    @Query('to') dateTo?: string,
    @Query('agentId') agentId?: string,
  ) {
    const csv = await this.service.exportCallsCsv(dateFrom, dateTo, agentId);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="calls-${Date.now()}.csv"`,
    );
    res.send(csv);
  }
}
