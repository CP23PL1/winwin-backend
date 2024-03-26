import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-streams-adapter';
import { Redis } from 'ioredis';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  async connectToRedis(host: string, port: number): Promise<void> {
    const redisClient = new Redis({
      host,
      port,
    });
    this.adapterConstructor = createAdapter(redisClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options) as Server;
    server._opts.connectionStateRecovery = {
      // the backup duration of the sessions and the packets
      maxDisconnectionDuration: 2 * 60 * 1000 /* 2 minutes */,
      // whether to skip middlewares upon successful recovery
      skipMiddlewares: true,
    };
    server.adapter(this.adapterConstructor);
    return server;
  }
}
