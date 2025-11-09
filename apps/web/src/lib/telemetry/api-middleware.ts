/**
 * API Telemetry Middleware
 * Tracks p95 latency and error rates for API endpoints
 * 
 * Usage:
 * ```typescript
 * import { withTelemetry } from '@/lib/telemetry/api-middleware';
 * 
 * export const GET = withTelemetry(async (req: NextRequest) => {
 *   // Your handler
 * });
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';

interface TelemetryMetrics {
  endpoint: string;
  method: string;
  duration: number;
  statusCode: number;
  error?: Error;
}

/**
 * Track API endpoint metrics
 * Sends metrics to observability system (Sentry, custom, etc.)
 */
async function trackMetrics(metrics: TelemetryMetrics): Promise<void> {
  // TODO: Send to observability system
  // For now, log to console (replace with actual telemetry)
  if (process.env.NODE_ENV === 'development') {
    console.log('[Telemetry]', {
      endpoint: metrics.endpoint,
      method: metrics.method,
      duration: `${metrics.duration}ms`,
      statusCode: metrics.statusCode,
      error: metrics.error?.message,
    });
  }

  // TODO: Send to Sentry/observability system
  // Example:
  // if (metrics.error) {
  //   Sentry.captureException(metrics.error, {
  //     tags: { endpoint: metrics.endpoint, method: metrics.method },
  //     extra: { duration: metrics.duration },
  //   });
  // }
  // 
  // // Track p95 latency
  // trackHistogram('api.latency', metrics.duration, {
  //   endpoint: metrics.endpoint,
  //   method: metrics.method,
  //   status_code: metrics.statusCode.toString(),
  // });
}

/**
 * Wraps an API route handler with telemetry tracking
 */
export function withTelemetry<T extends NextRequest>(
  handler: (req: T) => Promise<NextResponse>
) {
  return async (req: T): Promise<NextResponse> => {
    const start = Date.now();
    const url = new URL(req.url);
    const endpoint = url.pathname;
    const method = req.method;

    try {
      const response = await handler(req);
      const duration = Date.now() - start;

      // Track success metrics
      await trackMetrics({
        endpoint,
        method,
        duration,
        statusCode: response.status,
      });

      return response;
    } catch (error) {
      const duration = Date.now() - start;
      const err = error instanceof Error ? error : new Error(String(error));

      // Track error metrics
      await trackMetrics({
        endpoint,
        method,
        duration,
        statusCode: 500,
        error: err,
      });

      throw error;
    }
  };
}
