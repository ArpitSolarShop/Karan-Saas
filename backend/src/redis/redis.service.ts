import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis;

  onModuleInit() {
    this.redisClient = new Redis(
      process.env.REDIS_URL || 'redis://localhost:6379',
    );
  }

  onModuleDestroy() {
    this.redisClient.quit();
  }

  async pushToQueue(queueName: string, data: any) {
    await this.redisClient.lpush(queueName, JSON.stringify(data));
  }

  async popFromQueue(queueName: string) {
    const data = await this.redisClient.rpop(queueName);
    return data ? JSON.parse(data) : null;
  }

  async getQueueLength(queueName: string) {
    return this.redisClient.llen(queueName);
  }
}
