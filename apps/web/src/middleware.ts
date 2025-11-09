/**
 * Middleware for Automatic Monetization Tracking
 * Zero-effort tracking for affiliate links, API usage, and more
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // 1. Affiliate Link Tracking (Automatic)
  const affiliateCode = request.nextUrl.searchParams.get('ref');
  if (affiliateCode && request.nextUrl.pathname.startsWith('/')) {
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
        fetch(`${request.nextUrl.origin}/api/affiliate/track`, {
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

  // 2. API Rate Limiting (Automatic)
  if (request.nextUrl.pathname.startsWith('/api/v1/')) {
    const apiKey = request.headers.get('x-api-key');
    if (apiKey) {
      try {
        const supabase = createClient();
        const crypto = await import('crypto');
        const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
        
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
            endpoint: request.nextUrl.pathname,
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

  // 3. Apply Security Headers (Automatic)
  const { applySecurityHeaders } = await import('@/lib/security/headers');
  applySecurityHeaders(response.headers);

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
