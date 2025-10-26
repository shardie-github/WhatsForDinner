import { healthCheckSystem } from '@/lib/healthCheck';

export async function GET() {
  try {
    const health = await healthCheckSystem.runHealthChecks();

    return new Response(JSON.stringify(health), {
      status: health.overall === 'unhealthy' ? 503 : 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        overall: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
