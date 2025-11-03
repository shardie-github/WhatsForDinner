import { NextResponse } from 'next/server';
import { db, closeDb } from '@whats-for-dinner/server/db';
import { queueHealth } from '@whats-for-dinner/server/queue';
import { addSecurityHeaders } from '@whats-for-dinner/server/security/helmet';
import Redis from 'ioredis';

async function checkRedis(): Promise<{ healthy: boolean; latency?: number }> {
  try {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      return { healthy: false };
    }

    const redis = new Redis(redisUrl);
    const start = Date.now();
    await redis.ping();
    const latency = Date.now() - start;
    await redis.quit();
    return { healthy: true, latency };
  } catch (error) {
    return { healthy: false };
  }
}

async function checkDatabase(): Promise<{ healthy: boolean; latency?: number }> {
  try {
    const start = Date.now();
    await db.execute({ sql: 'SELECT 1', args: [] });
    const latency = Date.now() - start;
    return { healthy: true, latency };
  } catch (error) {
    return { healthy: false };
  }
}

export async function GET() {
  const start = Date.now();
  
  const [dbCheck, redisCheck, queueCheck] = await Promise.all([
    checkDatabase(),
    checkRedis(),
    queueHealth(),
  ]);

  const allHealthy = dbCheck.healthy && redisCheck.healthy && redisCheck.healthy;
  const status = allHealthy ? 200 : 503;

  const response = {
    status: allHealthy ? 'healthy' : 'degraded',
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    checks: {
      database: dbCheck,
      redis: redisCheck,
      queue: queueCheck,
    },
    responseTime: Date.now() - start,
  };

  let res = NextResponse.json(response, { status });
  res = addSecurityHeaders(res);
  return res;
}
