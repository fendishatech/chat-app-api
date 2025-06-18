import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly redis: Redis;
  private readonly logger = new Logger(RedisService.name);
  private isConnected = false;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT|| "6379") ,
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || "0"),
      lazyConnect: true,
      maxRetriesPerRequest: 3,
    });

    // Handle connection events
    this.redis.on('connect', () => {
      this.isConnected = true;
      this.logger.log('Connected to Redis');
    });

    this.redis.on('error', (err) => {
      this.isConnected = false;
      this.logger.warn(`Redis connection error: ${err.message}`);
    });

    this.redis.on('close', () => {
      this.isConnected = false;
      this.logger.log('Redis connection closed');
    });

    // Try to connect
    this.redis.connect().catch((err) => {
      this.logger.warn(`Failed to connect to Redis: ${err.message}`);
      this.logger.warn('Application will continue without Redis');
    });
  }

  getClient(): Redis {
    return this.redis;
  }

  isRedisConnected(): boolean {
    return this.isConnected;
  }

  async onModuleDestroy() {
    if (this.redis) {
      await this.redis.quit();
    }
  }
} 