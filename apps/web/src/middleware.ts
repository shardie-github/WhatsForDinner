import { NextRequest, NextResponse } from 'next/server';
import { monitoringSystem } from '@/lib/monitoring';
import { observabilitySystem } from '@/lib/observability';
import { logger } from '@/lib/logger';
import { processGuardianEvent } from '@/lib/guardian-middleware';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/rate-limiting-redis';
import { validateRequestSize } from '@/lib/input-validation';

// Rate limiting store (in production, use Redis or similar)
// TODO: Migrate to Redis for distributed rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Cleanup old rate limit entries periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
  }, 60000); // Clean up every minute
}

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
    // Request size validation
    const sizeValidation = validateRequestSize(request);
    if (!sizeValidation.valid) {
      await observabilitySystem.finishSpan(spanId, 'error', {
        error: 'Request size validation failed',
      });
      await observabilitySystem.finishTrace(traceId, 'error');
      
      return new NextResponse(
        JSON.stringify({
          error: 'Request too large',
          message: sizeValidation.error,
        }),
        {
          status: 413,
          headers: {
            'Content-Type': 'application/json',
            'X-Trace-Id': traceId,
          },
        }
      );
    }
    
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

    // Content Security Policy - Enhanced security
    const csp = [
      "default-src 'self'",
      // Scripts - use nonces in production for better security
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://www.googletagmanager.com https://js.sentry-cdn.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://api.openai.com https://*.supabase.co https://www.google-analytics.com https://*.sentry.io https://*.posthog.com wss://*.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-src 'none'",
      "object-src 'none'",
      "media-src 'self'",
      "worker-src 'self' blob:",
      "manifest-src 'self'",
      "upgrade-insecure-requests",
      "block-all-mixed-content",
    ].join('; ');

    response.headers.set('Content-Security-Policy', csp);
    
    // Additional security headers
    response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
    
    // HSTS Header (only in production with HTTPS)
    if (process.env.NODE_ENV === 'production' || process.env.FORCE_HSTS === 'true') {
      response.headers.set(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      );
    }
    
    // Expect-CT header for certificate transparency
    if (process.env.NODE_ENV === 'production') {
      response.headers.set(
        'Expect-CT',
        'max-age=86400, enforce'
      );
    }

    // Rate limiting - Try Redis first, fallback to in-memory
    const rateLimitConfig = getRateLimit(pathname);
    if (rateLimitConfig) {
      // Try to get user ID for better rate limiting
      let userId: string | undefined;
      try {
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id;
      } catch {
        // User not authenticated, use IP-based rate limiting
      }
      
      const identifier = getRateLimitIdentifier(request, userId);
      const rateLimitResult = await checkRateLimit(identifier, rateLimitConfig);
      
      if (!rateLimitResult.allowed) {
        await monitoringSystem.recordCounter('rate_limit_exceeded', 1, {
          path: pathname,
          ip,
          userAgent,
          identifier,
        });

        await logger.warn(
          'Rate limit exceeded',
          {
            path: pathname,
            ip,
            userAgent,
            identifier,
            limit: rateLimitConfig.requests,
          },
          'middleware',
          'rate_limiting'
        );

        await observabilitySystem.finishSpan(spanId, 'error', {
          error: 'Rate limit exceeded',
        });
        await observabilitySystem.finishTrace(traceId, 'error');

        const retryAfter = Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000);
        
        return new NextResponse(
          JSON.stringify({
            error: 'Rate limit exceeded',
            retryAfter,
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': retryAfter.toString(),
              'X-RateLimit-Limit': rateLimitConfig.requests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
              'X-Trace-Id': traceId,
            },
          }
        );
      }

      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', rateLimitConfig.requests.toString());
      response.headers.set(
        'X-RateLimit-Remaining',
        rateLimitResult.remaining.toString()
      );
      response.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());
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

    // Guardian: Process telemetry event (non-blocking)
    try {
      const supabase = createRouteHandlerClient({ cookies });
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && pathname.startsWith('/api/')) {
        // Determine data class based on path
        let dataClass: 'telemetry' | 'location' | 'audio' | 'biometrics' | 'content' | 'credentials' | 'personal_info' | 'metadata' = 'metadata';
        let scope: 'user' | 'app' | 'api' | 'external' = 'api';
        
        if (pathname.includes('/api/auth') || pathname.includes('/api/users')) {
          dataClass = 'credentials';
        } else if (pathname.includes('/api/ai')) {
          dataClass = 'content';
        } else if (pathname.includes('/api/telemetry') || pathname.includes('/api/analytics')) {
          dataClass = 'telemetry';
        } else {
          dataClass = 'metadata';
        }

        // Determine scope
        if (pathname.includes('/api/external') || pathname.includes('/api/partner')) {
          scope = 'external';
        } else {
          scope = 'api';
        }

        // Process Guardian event (non-blocking, don't await)
        processGuardianEvent(request, user.id, {
          type: 'api_call',
          scope,
          dataClass,
          action: `${method.toLowerCase()}_${pathname}`,
          target: pathname,
          metadata: {
            method,
            pathname,
            ip,
            userAgent,
            traceId,
          },
        }).catch(err => {
          // Log but don't block request
          console.error('Guardian event processing failed:', err);
        });
      }
    } catch (error) {
      // Guardian errors should not block requests
      // Error handled: Guardian integration error:
    }

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

    // Don't leak error details in production
    const errorMessage = process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : error instanceof Error ? error.message : 'Unknown error';
    
    return new NextResponse(
      JSON.stringify({
        error: 'Internal server error',
        traceId,
        ...(process.env.NODE_ENV !== 'production' && { details: errorMessage }),
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
