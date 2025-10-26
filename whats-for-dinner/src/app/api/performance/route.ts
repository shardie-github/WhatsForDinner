import { performanceOptimizer } from '@/lib/performanceOptimizer';
import { NextRequest } from 'next/server';

export async function GET() {
  try {
    const report = await performanceOptimizer.generatePerformanceReport();

    return new Response(JSON.stringify(report), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { metrics } = body;

    if (!metrics) {
      return new Response(
        JSON.stringify({
          error: 'Metrics are required',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    await performanceOptimizer.recordPerformanceMetrics(metrics);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Performance metrics recorded successfully',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
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
