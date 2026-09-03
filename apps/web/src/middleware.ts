/**
 * Next.js Middleware
 * 
 * Adds Sentry tracking and performance monitoring to all requests
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Initialize Sentry for edge runtime
if (typeof window === 'undefined') {
  try {
    const { initSentry } = require('./lib/sentry-config');
    initSentry();
  } catch (error) {
    // Sentry not available, continue without it
  }
}

export function middleware(request: NextRequest) {
  const startTime = Date.now();
  // CSRF protection
  const origin = request.headers.get("origin");
  const allowedOrigins = process.env.CORS_ORIGINS?.split(",") || [];
  
  if (request.method !== "GET" && origin && !allowedOrigins.includes(origin)) {
    return new NextResponse("Invalid origin", { status: 403 });
  }
  const response = NextResponse.next();

  // Add performance headers
  response.headers.set('X-Request-ID', crypto.randomUUID());
  response.headers.set('X-Response-Time', '0ms');

  // Track performance after response
  if (typeof window === 'undefined') {
    const duration = Date.now() - startTime;
    response.headers.set('X-Response-Time', `${duration}ms`);

    // Log slow requests
    if (duration > 1000) {
      console.warn(`Slow request: ${request.nextUrl.pathname} took ${duration}ms`);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
