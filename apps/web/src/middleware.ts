import { NextRequest, NextResponse } from 'next/server';
import { monitoringSystem } from '@/lib/monitoring';
import { observabilitySystem } from '@/lib/observability';
import { logger } from '@/lib/logger';

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration (can be overridden via env vars)
const getRateLimitConfig = () => {
  const defaultLimits = {
    '/api/': { requests: 100, window: 60 * 1000 },
    '/api/auth': { requests: 5, window: 60 * 1000 }, // Stricter for auth
    '/api/recipes': { requests: 20, window: 60 * 1000 },
    '/api/ai': { requests: 10, window: 60 * 1000 },
    '/api/billing': { requests: 10, window: 60 * 1000 }, // Stricter for billing
    '/api/health': { requests: 60, window: 60 * 1000 },
    '/api/metrics': { requests: 30, window: 60 * 1000 },
    '/api/alerts': { requests: 30, window: 60 * 1000 },
    '/api/traces': { requests: 30, window: 60 * 1000 },
    '/api/logs': { requests: 30, window: 60 * 1000 },
    '/api/errors': { requests: 30, window: 60 * 1000 },
    '/api/observability': { requests: 30, window: 60 * 1000 },
  };
  
  // Override with env vars if provided
  const envRateLimit = process.env.RATE_LIMIT_REQUESTS 
    ? parseInt(process.env.RATE_LIMIT_REQUESTS, 10) 
    : null;
  const envWindow = process.env.RATE_LIMIT_WINDOW
    ? parseInt(process.env.RATE_LIMIT_WINDOW, 10) * 1000
    : null;
    
  if (envRateLimit && envWindow) {
    // Apply global rate limit if specified
    return {
      '/api/': { requests: envRateLimit, window: envWindow },
      ...Object.fromEntries(
        Object.entries(defaultLimits).map(([path, config]) => [
          path,
          path === '/api/' 
            ? { requests: envRateLimit, window: envWindow }
            : config
        ])
      ),
    };
  }
  
  return defaultLimits;
};

const RATE_LIMITS = getRateLimitConfig();

export async function middleware(request: NextRequest) {
  const startTime = Date.now();
  const { pathname, method } = request;
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  // Start trace for the request
  const traceId = await observabilitySystem.startTrace(
    `${method} ${pathname}`,
    undefined,
    undefined,
    request.headers.get('x-request-id') || undefined,
    {
      ip,
      userAgent,
      pathname,
      method,
    }
  );

  const spanId = await observabilitySystem.startSpan(traceId, 'middleware');

  try {
    // Security headers
    const response = NextResponse.next();

    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=()'
    );

    // Content Security Policy
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://www.googletagmanager.com https://js.sentry-cdn.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://api.openai.com https://*.supabase.co https://www.google-analytics.com https://*.sentry.io https://*.posthog.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-src 'none'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join('; ');

    response.headers.set('Content-Security-Policy', csp);
    
    // HSTS Header (only in production with HTTPS)
    if (process.env.NODE_ENV === 'production') {
      response.headers.set(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      );
    }

    // Rate limiting
    const rateLimit = getRateLimit(pathname);
    if (rateLimit) {
      const key = `${ip}:${pathname}`;
      const now = Date.now();
      const windowStart = now - rateLimit.window;

      // Clean up old entries
      for (const [k, v] of rateLimitStore.entries()) {
        if (v.resetTime < now) {
          rateLimitStore.delete(k);
        }
      }

      const current = rateLimitStore.get(key) || {
        count: 0,
        resetTime: now + rateLimit.window,
      };

      if (current.resetTime < now) {
        current.count = 0;
        current.resetTime = now + rateLimit.window;
      }

      current.count++;
      rateLimitStore.set(key, current);

      if (current.count > rateLimit.requests) {
        await monitoringSystem.recordCounter('rate_limit_exceeded', 1, {
          path: pathname,
          ip,
          userAgent,
        });

        await logger.warn(
          'Rate limit exceeded',
          {
            path: pathname,
            ip,
            userAgent,
            count: current.count,
            limit: rateLimit.requests,
          },
          'middleware',
          'rate_limiting'
        );

        await observabilitySystem.finishSpan(spanId, 'error', {
          error: 'Rate limit exceeded',
          rateLimit: current.count,
        });
        await observabilitySystem.finishTrace(traceId, 'error');

        return new NextResponse(
          JSON.stringify({
            error: 'Rate limit exceeded',
            retryAfter: Math.ceil((current.resetTime - now) / 1000),
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': Math.ceil(
                (current.resetTime - now) / 1000
              ).toString(),
              'X-RateLimit-Limit': rateLimit.requests.toString(),
              'X-RateLimit-Remaining': Math.max(
                0,
                rateLimit.requests - current.count
              ).toString(),
              'X-RateLimit-Reset': current.resetTime.toString(),
            },
          }
        );
      }

      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', rateLimit.requests.toString());
      response.headers.set(
        'X-RateLimit-Remaining',
        Math.max(0, rateLimit.requests - current.count).toString()
      );
      response.headers.set('X-RateLimit-Reset', current.resetTime.toString());
    }

    // Request logging
    await logger.info(
      `${method} ${pathname}`,
      {
        ip,
        userAgent,
        pathname,
        method,
        traceId,
      },
      'middleware',
      'request'
    );

    // Record request metric
    await monitoringSystem.recordCounter('http_requests', 1, {
      method,
      path: pathname,
      status: 'pending',
    });

    // Add trace ID to response headers
    response.headers.set('X-Trace-Id', traceId);

    // Continue with the request
    const result = await NextResponse.next();

    // Record response metrics
    const duration = Date.now() - startTime;
    const statusCode = result.status;

    await monitoringSystem.recordTimer('http_response_time', duration, {
      method,
      path: pathname,
      status_code: statusCode.toString(),
    });

    await monitoringSystem.recordCounter('http_responses', 1, {
      method,
      path: pathname,
      status_code: statusCode.toString(),
    });

    if (statusCode >= 400) {
      await monitoringSystem.recordCounter('http_errors', 1, {
        method,
        path: pathname,
        status_code: statusCode.toString(),
      });
    }

    // Add performance headers
    result.headers.set('X-Response-Time', duration.toString());
    result.headers.set('X-Trace-Id', traceId);

    // Finish tracing
    await observabilitySystem.finishSpan(
      spanId,
      statusCode >= 400 ? 'error' : 'completed',
      {
        statusCode,
        duration,
      }
    );
    await observabilitySystem.finishTrace(
      traceId,
      statusCode >= 400 ? 'error' : 'completed'
    );

    return result;
  } catch (error) {
    // Error handling
    const duration = Date.now() - startTime;

    await monitoringSystem.recordCounter('middleware_errors', 1, {
      path: pathname,
      method,
      error: error.message,
    });

    await logger.error(
      'Middleware error',
      {
        error: error.message,
        stack: error.stack,
        pathname,
        method,
        ip,
        userAgent,
        traceId,
      },
      'middleware',
      'error'
    );

    await observabilitySystem.finishSpan(spanId, 'error', {
      error: error.message,
      duration,
    });
    await observabilitySystem.finishTrace(traceId, 'error');

    return new NextResponse(
      JSON.stringify({
        error: 'Internal server error',
        traceId,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'X-Trace-Id': traceId,
        },
      }
    );
  }
}

function getRateLimit(
  pathname: string
): { requests: number; window: number } | null {
  // Find the most specific matching rate limit
  const sortedPaths = Object.keys(RATE_LIMITS).sort(
    (a, b) => b.length - a.length
  );

  for (const path of sortedPaths) {
    if (pathname.startsWith(path)) {
      return RATE_LIMITS[path as keyof typeof RATE_LIMITS];
    }
  }

  return null;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
