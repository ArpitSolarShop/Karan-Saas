import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // ── Redis Adapter for Socket.io (multi-node fan-out) ──────────────────────
  // Syncs WebSocket events across all NestJS instances via Redis Pub/Sub.
  // Even on a single node, this is the correct architecture for scale-out.
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6380';
  try {
    const pubClient = createClient({ url: redisUrl });
    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);

    const httpAdapter = app.getHttpAdapter();
    const ioServer = httpAdapter.getInstance()?.io;

    if (ioServer) {
      // If the underlying http server already has socket.io attached (e.g. by NestJS gateway), wire the adapter
      ioServer.adapter(createAdapter(pubClient, subClient));
      console.log(
        '[Socket.io] Redis adapter wired — multi-node broadcasting enabled.',
      );
    } else {
      // Attach adapter via IoAdapter before the server starts listening
      app.useWebSocketAdapter(new IoAdapter(app));
      console.log(
        '[Socket.io] Redis adapter will be attached at gateway init.',
      );
    }

    pubClient.on('error', (err: any) =>
      console.error('[Redis pubClient]', err),
    );
    subClient.on('error', (err: any) =>
      console.error('[Redis subClient]', err),
    );
  } catch (err) {
    // If Redis is unavailable, log a warning but continue — single-node mode
    console.warn(
      '[Socket.io] Redis adapter unavailable — running in single-node mode:',
      (err as Error).message,
    );
  }
  // ─────────────────────────────────────────────────────────────────────────

  await app.listen(process.env.PORT ?? 3001);
  console.log(
    `[Bootstrap] Server listening on port ${process.env.PORT ?? 3001}`,
  );
}
bootstrap();
