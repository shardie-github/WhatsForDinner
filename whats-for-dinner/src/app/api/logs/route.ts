import { observabilitySystem } from '@/lib/observability';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level');
    const service = searchParams.get('service');
    const component = searchParams.get('component');
    const startTime = searchParams.get('startTime');
    const endTime = searchParams.get('endTime');
    const limit = searchParams.get('limit');

    const filters: any = {};
    if (level) filters.level = level;
    if (service) filters.service = service;
    if (component) filters.component = component;
    if (startTime) filters.startTime = startTime;
    if (endTime) filters.endTime = endTime;
    if (limit) filters.limit = parseInt(limit);

    const logs = await observabilitySystem.getLogs(filters);

    return new Response(
      JSON.stringify({
        logs,
        count: logs.length,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
