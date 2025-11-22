/**
 * Middleware for Automatic Monetization Tracking
 * Zero-effort tracking for affiliate links, API usage, and more
 * Enhanced with Vercel security hardening: preview guards, admin protection, CSP
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const ADMIN_PATHS = [/^\/admin(\/.*)?$/];
const CSP_MODE: 'strict' | 'balanced' | 'loose' = (process.env.CSP_MODE as any) || 'balanced';
const IMAGE_DOMAINS = (process.env.NEXT_PUBLIC_IMAGE_DOMAINS || 'images.unsplash.com,cdn.shopify.com').split(',').map(d => d.trim());
const PREVIEW_REQUIRE_AUTH = process.env.PREVIEW_REQUIRE_AUTH !== 'false';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const response = NextResponse.next();

  // Detect preview environment
  const isPreview = url.host.includes('-git-') || url.host.includes('-vercel.app') || process.env.VERCEL_ENV === 'preview';

  // 1. Preview Environment Hardening
  if (isPreview) {
    // Add preview banner header (frontend can render if present)
    response.headers.set('X-Preview-Env', 'true');

    // Admin path protection in preview
    const needsAdminGuard = ADMIN_PATHS.some(rx => rx.test(url.pathname));
    if (needsAdminGuard && PREVIEW_REQUIRE_AUTH) {
      const authHeader = request.headers.get('authorization') || '';
      const adminAuthSecret = process.env.ADMIN_BASIC_AUTH; // Expected format: "user:pass" (base64 encoded in env)
      
      if (!adminAuthSecret) {
        // No secret configured - deny access in preview
        return new NextResponse('Protected in preview environment', {
          status: 401,
          headers: {
            'WWW-Authenticate': 'Basic realm="Admin Preview"',
            'X-Preview-Env': 'true',
          },
        });
      }

      // Basic auth check
      if (!authHeader.startsWith('Basic ')) {
        return new NextResponse('Unauthorized', {
          status: 401,
          headers: {
            'WWW-Authenticate': 'Basic realm="Admin"',
            'X-Preview-Env': 'true',
          },
        });
      }

      // Verify credentials (basic check - in production, use proper verification)
      try {
        const encoded = authHeader.replace('Basic ', '');
        const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
        const [user, pass] = decoded.split(':');
        const [expectedUser, expectedPass] = adminAuthSecret.split(':');
        
        if (user !== expectedUser || pass !== expectedPass) {
          return new NextResponse('Unauthorized', {
            status: 401,
            headers: {
              'WWW-Authenticate': 'Basic realm="Admin"',
              'X-Preview-Env': 'true',
            },
          });
        }
      } catch {
        return new NextResponse('Unauthorized', {
          status: 401,
          headers: {
            'WWW-Authenticate': 'Basic realm="Admin"',
            'X-Preview-Env': 'true',
          },
        });
      }
    }
  }

  // 2. Affiliate Link Tracking (Automatic)
  const affiliateCode = url.searchParams.get('ref');
  if (affiliateCode && url.pathname.startsWith('/')) {
    // Track affiliate click automatically
    try {
      const supabase = createClient();
      const { data: affiliate } = await supabase
        .from('affiliates')
        .select('id')
        .eq('affiliate_code', affiliateCode)
        .eq('status', 'active')
        .single();

      if (affiliate) {
        // Set cookie for conversion tracking
        response.cookies.set('affiliate_code', affiliateCode, {
          maxAge: 30 * 24 * 60 * 60, // 30 days
          httpOnly: false,
          sameSite: 'lax',
        });

        // Track click (async, don't block)
        fetch(`${url.origin}/api/affiliate/track`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            affiliateCode,
            referralId: request.headers.get('x-forwarded-for') || 'unknown',
          }),
        }).catch(() => {}); // Fail silently
      }
    } catch (error) {
      // Fail silently - don't block request
    }
  }

  // 3. API Rate Limiting (Automatic) - Only if API monetization enabled
  if (process.env.API_MONETIZATION_ENABLED === 'true' && url.pathname.startsWith('/api/v1/')) {
    const apiKey = request.headers.get('x-api-key');
    if (apiKey) {
      try {
        const supabase = createClient();
        // Use Web Crypto API for Edge runtime compatibility
        const encoder = new TextEncoder();
        const data = encoder.encode(apiKey);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const keyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        const { data: key } = await supabase
          .from('api_keys')
          .select('id, rate_limit, monthly_limit, status')
          .eq('key_hash', keyHash)
          .eq('status', 'active')
          .single();

        if (key) {
          // Check monthly limit
          const { data: usage } = await supabase
            .from('api_usage')
            .select('requests_count')
            .eq('key_id', key.id)
            .gte('created_at', new Date(new Date().setDate(1)).toISOString())
            .single();

          const requestsThisMonth = usage?.requests_count || 0;
          if (requestsThisMonth >= key.monthly_limit) {
            return NextResponse.json(
              { error: 'Monthly limit exceeded' },
              { status: 429 }
            );
          }

          // Track usage (async)
          supabase.from('api_usage').insert({
            key_id: key.id,
            endpoint: url.pathname,
            requests_count: 1,
            created_at: new Date().toISOString(),
          }).catch(() => {});

          // Rate limiting headers
          response.headers.set('X-RateLimit-Limit', key.rate_limit.toString());
          response.headers.set('X-RateLimit-Remaining', (key.rate_limit - 1).toString());
        } else {
          return NextResponse.json(
            { error: 'Invalid API key' },
            { status: 401 }
          );
        }
      } catch (error) {
        return NextResponse.json(
          { error: 'API authentication failed' },
          { status: 500 }
        );
      }
    }
  }

  // 4. Apply Security Headers (Automatic) with CSP mode and image domains
  const { applySecurityHeaders } = await import('@/lib/security/headers');
  applySecurityHeaders(response.headers, CSP_MODE, IMAGE_DOMAINS);

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
