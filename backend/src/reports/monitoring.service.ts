import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class MonitoringService implements OnModuleInit {
  private readonly logger = new Logger(MonitoringService.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private eventEmitter: EventEmitter2,
  ) {}

  async onModuleInit() {
    this.logger.log('[Monitoring] Initializing multi-tenant real-time BI counters...');
    // Initial refresh will happen on-demand or via a scheduled worker for each tenant
  }

  /**
   * Recalculates metrics from DB for a specific tenant and caches them in Redis
   */
  async refreshTenantMetrics(tenantId: string) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [totalCallsToday, conversionRate] = await Promise.all([
        this.prisma.call.count({ where: { tenantId, createdAt: { gte: today } } }),
        this.calculateDailyConversion(tenantId, today),
      ]);

      await this.redis.set(`bi:${tenantId}:calls_today`, totalCallsToday);
      await this.redis.set(`bi:${tenantId}:conversion_today`, conversionRate);
      
      this.broadcastUpdate(tenantId);
    } catch (err) {
      this.logger.error(`[Monitoring] Failed to refresh metrics for tenant ${tenantId}: ${err.message}`);
    }
  }

  private async calculateDailyConversion(tenantId: string, since: Date): Promise<string> {
    const totalLeads = await this.prisma.lead.count({ where: { tenantId, createdAt: { gte: since } } });
    const convertedLeads = await this.prisma.lead.count({ 
      where: { tenantId, createdAt: { gte: since }, status: 'CONVERTED' } 
    });
    
    if (totalLeads === 0) return '0%';
    return ((convertedLeads / totalLeads) * 100).toFixed(1) + '%';
  }

  /**
   * Listens for Call Events to increment counters in real-time (Zero Latency)
   */
  @OnEvent('call.created')
  async handleCallCreated(payload: any) {
    const tenantId = payload.tenantId;
    if (!tenantId) return;
    await this.redis.incr(`bi:${tenantId}:calls_today`);
    await this.redis.incr(`bi:${tenantId}:active_calls`);
    this.broadcastUpdate(tenantId);
  }

  @OnEvent('call.completed')
  async handleCallCompleted(payload: any) {
    const tenantId = payload.tenantId;
    if (!tenantId) return;
    // Basic active calls logic
    const active = await this.redis.get(`bi:${tenantId}:active_calls`);
    if (active && active > 0) {
      await this.redis.set(`bi:${tenantId}:active_calls`, active - 1);
    }
    this.broadcastUpdate(tenantId);
  }

  /**
   * Fetches the aggregated BI state for the Wallboard
   */
  async getLiveWallboard(tenantId: string) {
    const [callsToday, activeCalls, conversion, agentsOnline] = await Promise.all([
      this.redis.get(`bi:${tenantId}:calls_today`),
      this.redis.get(`bi:${tenantId}:active_calls`),
      this.redis.get(`bi:${tenantId}:conversion_today`),
      this.redis.get(`bi:${tenantId}:agents_online`),
    ]);

    return {
      timestamp: new Date().toISOString(),
      callsToday: Number(callsToday) || 0,
      activeCalls: Number(activeCalls) || 0,
      conversionRate: conversion || '0%',
      agentsOnline: Number(agentsOnline) || 0,
    };
  }

  private async broadcastUpdate(tenantId: string) {
    const data = await this.getLiveWallboard(tenantId);
    this.eventEmitter.emit(`bi.${tenantId}.wallboard.update`, data);
  }
}
