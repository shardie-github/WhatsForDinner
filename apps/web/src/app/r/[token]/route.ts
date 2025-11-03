/**
 * Partner Link Redirect Handler
 * 
 * Handles /r/:token redirects, logs clicks, sets attribution cookies,
 * and redirects to destination with proper tracking.
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
// Import from server package - adjust path as needed
// For Next.js, we'll need to create a server action or API route for DB access

/**
 * GET /r/:token
 * Resolve token, log click, set attribution cookie, redirect
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;

    // For now, we'll support both token-based lookup and direct signed URL
    // In production, token -> signed_url mapping should be in Redis
    
    // Try to resolve as signed URL directly (if token is the signed URL hash)
    let linkData = await verifySignedUrl(request.url);

    // If that fails, try token lookup (would need separate token table in production)
    if (!linkData) {
      // For MVP, we'll extract from URL params if present
      const signedUrl = request.nextUrl.searchParams.get('url');
      if (signedUrl) {
        linkData = await verifySignedUrl(signedUrl);
      }
    }

    if (!linkData) {
      return NextResponse.json({ error: 'Invalid or expired link' }, { status: 404 });
    }

    // Get user context (may be null for anonymous)
    const userId = request.headers.get('x-user-id'); // Set by auth middleware if authenticated
    const anonId = request.cookies.get('anon_id')?.value || crypto.randomUUID();
    const consent = request.cookies.get('consent')?.value === 'true';

    // Get geo and UA info
    const country = request.geo?.country || 
                   request.headers.get('cf-ipcountry') ||
                   request.headers.get('x-vercel-ip-country') || 
                   'US';
    
    const userAgent = request.headers.get('user-agent') || '';
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               request.ip ||
               '';

    // Hash sensitive data
    const uaHash = crypto.createHash('sha256').update(userAgent).digest('hex').substring(0, 16);
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);

    // Get campaign ID if present in meta
    const campaignId = linkData.meta?.campaign_id as string | undefined;

    // Log click (async, don't wait)
    db.insert(clicks).values({
      user_id: userId || null,
      anon_id: anonId,
      partner_id: linkData.partner_id,
      campaign_id: campaignId || null,
      sku: linkData.sku || null,
      source: 'redirect',
      country,
      ua_hash: uaHash,
      ip_hash: ipHash,
      consent,
      signature: crypto.randomBytes(16).toString('hex'),
    }).catch((error) => {
      console.error('Failed to log click', error);
    });

    // Set attribution cookie (7-day default, or partner's window)
    const [partner] = await db
      .select()
      .from(partners)
      .where(eq(partners.id, linkData.partner_id))
      .limit(1);

    const attributionWindowDays = partner?.attribution_window_days || 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + attributionWindowDays);

    // Build redirect response
    const redirectResponse = NextResponse.redirect(linkData.destination, 302);

    // Set attribution cookie
    redirectResponse.cookies.set('partner_attribution', JSON.stringify({
      partner_id: linkData.partner_id,
      sku: linkData.sku,
      timestamp: Date.now(),
      expires_at: expiresAt.getTime(),
    }), {
      expires: expiresAt,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    // Set anon_id if not present
    if (!request.cookies.get('anon_id')) {
      redirectResponse.cookies.set('anon_id', anonId, {
        maxAge: 60 * 60 * 24 * 365, // 1 year
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
    }

    return redirectResponse;
  } catch (error) {
    console.error('Redirect handler error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
