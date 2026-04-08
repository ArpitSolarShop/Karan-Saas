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
    this.logger.log('[Monitoring] Initializing real-time BI counters...');
    await this.refreshGlobalMetrics();
    
    // Periodically refresh every 60s to ensure consistency with DB
    setInterval(() => this.refreshGlobalMetrics(), 60000);
  }

  /**
   * Recalculates heavy metrics from DB and caches them in Redis
   */
  async refreshGlobalMetrics() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [totalCallsToday, conversionRate] = await Promise.all([
        this.prisma.call.count({ where: { createdAt: { gte: today } } }),
        this.calculateDailyConversion(today),
      ]);

      await this.redis.set('bi:calls_today', totalCallsToday);
      await this.redis.set('bi:conversion_today', conversionRate);
      
      this.broadcastUpdate();
    } catch (err) {
      this.logger.error(`[Monitoring] Failed to refresh metrics: ${err.message}`);
    }
  }

  private async calculateDailyConversion(since: Date): Promise<string> {
    const totalLeads = await this.prisma.lead.count({ where: { createdAt: { gte: since } } });
    const convertedLeads = await this.prisma.lead.count({ 
      where: { createdAt: { gte: since }, status: 'CONVERTED' } 
    });
    
    if (totalLeads === 0) return '0%';
    return ((convertedLeads / totalLeads) * 100).toFixed(1) + '%';
  }

  /**
   * Listens for Call Events to increment counters in real-time (Zero Latency)
   */
  @OnEvent('call.created')
  async handleCallCreated(payload: any) {
    await this.redis.incr('bi:calls_today');
    await this.redis.incr('bi:active_calls');
    this.broadcastUpdate();
  }

  @OnEvent('call.completed')
  async handleCallCompleted(payload: any) {
    // Basic active calls logic
    const active = await this.redis.get('bi:active_calls');
    if (active && active > 0) {
      await this.redis.set('bi:active_calls', active - 1);
    }
    this.broadcastUpdate();
  }

  /**
   * Fetches the aggregated BI state for the Wallboard
   */
  async getLiveWallboard() {
    const [callsToday, activeCalls, conversion, agentsOnline] = await Promise.all([
      this.redis.get('bi:calls_today'),
      this.redis.get('bi:active_calls'),
      this.redis.get('bi:conversion_today'),
      this.redis.get('bi:agents_online'),
    ]);

    return {
      timestamp: new Date().toISOString(),
      callsToday: Number(callsToday) || 0,
      activeCalls: Number(activeCalls) || 0,
      conversionRate: conversion || '0%',
      agentsOnline: Number(agentsOnline) || 0,
    };
  }

  private async broadcastUpdate() {
    const data = await this.getLiveWallboard();
    this.eventEmitter.emit('bi.wallboard.update', data);
  }
}
