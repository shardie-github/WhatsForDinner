/**
 * CORS Configuration for What's for Dinner
 *
 * This module provides secure CORS configuration for API endpoints
 * with proper origin validation and security headers.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export interface CORSOptions {
  origin: string | string[] | boolean;
  methods: string[];
  allowedHeaders: string[];
  credentials: boolean;
  maxAge: number;
}

export const corsConfig: CORSOptions = {
  origin:
    process.env.NODE_ENV === 'production'
      ? [
          'https://whats-for-dinner.vercel.app',
          'https://whats-for-dinner-green.vercel.app',
          'https://whats-for-dinner-blue.vercel.app',
        ]
      : [
          'http://localhost:3000',
          'http://localhost:3001',
          'http://127.0.0.1:3000',
        ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
    'X-API-Key',
    'X-Client-Version',
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
};

export function handleCORS(request: NextRequest): NextResponse | null {
  const origin = request.headers.get('origin');
  const method = request.method;

  // Handle preflight requests
  if (method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 });

    // Set CORS headers
    setCORSHeaders(response, origin);

    return response;
  }

  // Validate origin for actual requests
  if (origin && !isValidOrigin(origin)) {
    return new NextResponse(
      JSON.stringify({ error: 'CORS policy violation: Invalid origin' }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  return null;
}

export function setCORSHeaders(
  response: NextResponse,
  origin?: string | null
): void {
  // Set Access-Control-Allow-Origin
  if (origin && isValidOrigin(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  } else if (Array.isArray(corsConfig.origin)) {
    response.headers.set('Access-Control-Allow-Origin', corsConfig.origin[0]);
  } else {
    response.headers.set('Access-Control-Allow-Origin', '*');
  }

  // Set other CORS headers
  response.headers.set(
    'Access-Control-Allow-Methods',
    corsConfig.methods.join(', ')
  );
  response.headers.set(
    'Access-Control-Allow-Headers',
    corsConfig.allowedHeaders.join(', ')
  );
  response.headers.set(
    'Access-Control-Allow-Credentials',
    corsConfig.credentials.toString()
  );
  response.headers.set('Access-Control-Max-Age', corsConfig.maxAge.toString());

  // Set security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );
}

function isValidOrigin(origin: string): boolean {
  if (typeof corsConfig.origin === 'boolean') {
    return corsConfig.origin;
  }

  if (Array.isArray(corsConfig.origin)) {
    return corsConfig.origin.includes(origin);
  }

  return corsConfig.origin === origin;
}

export function createCORSResponse(
  data: any,
  status: number = 200
): NextResponse {
  const response = new NextResponse(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Set CORS headers
  setCORSHeaders(response);

  return response;
}

export function createCORSErrorResponse(
  message: string,
  status: number = 400
): NextResponse {
  return createCORSResponse({ error: message }, status);
}

// Middleware for API routes
export function withCORS(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    // Handle CORS
    const corsResponse = handleCORS(req);
    if (corsResponse) {
      return corsResponse;
    }

    // Call the actual handler
    const response = await handler(req);

    // Set CORS headers on the response
    const origin = req.headers.get('origin');
    setCORSHeaders(response, origin);

    return response;
  };
}

// Rate limiting configuration
export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
};

// Security headers configuration
export const securityHeaders = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://checkout.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.stripe.com https://checkout.stripe.com https://*.supabase.co https://api.openai.com",
    "frame-src 'self' https://js.stripe.com https://checkout.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; '),
};

export function setSecurityHeaders(response: NextResponse): void {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
}
