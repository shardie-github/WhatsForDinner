import { NextRequest, NextResponse } from 'next/server';
import { validateCSRFToken } from '@/lib/csrf';

/**
 * CSRF protection middleware for API routes
 */
export async function withCSRFProtection(
  handler: (req: NextRequest) => Promise<NextResponse>,
  req: NextRequest
): Promise<NextResponse> {
  // Skip CSRF check for GET requests
  if (req.method === 'GET' || req.method === 'HEAD') {
    return handler(req);
  }

  // Skip CSRF check for public endpoints, webhooks, and guest onboarding routes
  const publicPaths = [
    '/api/public',
    '/api/health',
    '/api/metrics',
    '/api/pantry/bulk',
    '/api/analytics/track',
    '/api/grocery/cart-export',
    '/api/meal-plan/generate',
    '/api/stripe/webhook',
    '/api/partner/webhook',
    '/api/r',
  ];
  const isPublicPath = publicPaths.some(path => req.nextUrl.pathname.startsWith(path));
  
  if (isPublicPath) {
    return handler(req);
  }

  // Get CSRF token from header
  const csrfToken = req.headers.get('x-csrf-token');
  
  if (!csrfToken) {
    return NextResponse.json(
      { error: 'CSRF token missing' },
      { status: 403 }
    );
  }

  // Validate CSRF token
  const isValid = await validateCSRFToken(csrfToken);
  
  if (!isValid) {
    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    );
  }

  return handler(req);
}
