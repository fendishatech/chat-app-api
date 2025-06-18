import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import Redis from 'ioredis';
import { INestApplication, Logger } from '@nestjs/common';

export class RedisIoAdapter extends IoAdapter {
  private pubClient: Redis;
  private subClient: Redis;
  private readonly logger = new Logger(RedisIoAdapter.name);
  private isRedisConnected = false;

  async connectToRedis(): Promise<void> {
    try {
      const redisConfig = {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0'),
        lazyConnect: true,
        maxRetriesPerRequest: 3,
      };

      this.pubClient = new Redis(redisConfig);
      this.subClient = new Redis(redisConfig);

      // Wait for connections to be established
      await Promise.all([
        this.pubClient.ping(),
        this.subClient.ping(),
      ]);

      this.isRedisConnected = true;
      this.logger.log('Redis adapter connected successfully');
    } catch (error) {
      this.isRedisConnected = false;
      this.logger.warn(`Redis adapter failed to connect: ${error.message}`);
      this.logger.warn('Socket.IO will work without Redis clustering');
    }
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: '*',
      },
    });

    // Only add Redis pub/sub if Redis is connected
    if (this.isRedisConnected && this.pubClient) {
      server.on('connection', (socket) => {
        socket.on('join-room', (room) => {
          socket.join(room);
          this.pubClient.publish('room-joined', JSON.stringify({ socketId: socket.id, room }));
        });

        socket.on('leave-room', (room) => {
          socket.leave(room);
          this.pubClient.publish('room-left', JSON.stringify({ socketId: socket.id, room }));
        });
      });
    }

    return server;
  }

  async close(): Promise<void> {
    if (this.pubClient) await this.pubClient.quit();
    if (this.subClient) await this.subClient.quit();
  }
} 