/**
 * Security Headers Configuration
 * Provides security headers for Next.js middleware and API routes
 */

export type CSPMode = 'strict' | 'balanced' | 'loose';

export interface SecurityHeaders {
  'X-DNS-Prefetch-Control': string;
  'Strict-Transport-Security': string;
  'X-Frame-Options': string;
  'X-Content-Type-Options': string;
  'X-XSS-Protection': string;
  'Referrer-Policy': string;
  'Content-Security-Policy': string;
  'Permissions-Policy': string;
  'X-Permitted-Cross-Domain-Policies': string;
}

/**
 * Generate CSP based on mode and image domains
 */
function generateCSP(mode: CSPMode = 'balanced', imageDomains: string[] = []): string {
  const imageSrc = [
    "'self'",
    'data:',
    'https:',
    ...imageDomains.map(domain => `https://${domain}`),
  ].join(' ');

  switch (mode) {
    case 'strict':
      return [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self'",
        `img-src 'self' data: ${imageDomains.map(d => `https://${d}`).join(' ')}`,
        "font-src 'self' data:",
        "connect-src 'self' https://*.supabase.co https://*.vercel.app",
        "frame-ancestors 'self'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; ');

    case 'balanced':
      return [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
        "style-src 'self' 'unsafe-inline' https:",
        `img-src 'self' data: ${imageSrc}`,
        "font-src 'self' data: https:",
        "connect-src 'self' https:",
        "frame-ancestors 'self'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; ');

    case 'loose':
      return [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
        "style-src 'self' 'unsafe-inline' https:",
        `img-src 'self' data: https: ${imageDomains.map(d => `https://${d}`).join(' ')}`,
        "font-src 'self' data: https:",
        "connect-src 'self' https:",
        "frame-ancestors 'self'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; ');

    default:
      return generateCSP('balanced', imageDomains);
  }
}

/**
 * Get security headers with configurable CSP
 */
export function getSecurityHeaders(
  cspMode: CSPMode = 'balanced',
  imageDomains: string[] = []
): SecurityHeaders {
  return {
    'X-DNS-Prefetch-Control': 'on',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': generateCSP(cspMode, imageDomains),
    'Permissions-Policy': [
      'geolocation=()',
      'microphone=()',
      'camera=()',
      'interest-cohort=()',
    ].join(', '),
    'X-Permitted-Cross-Domain-Policies': 'none',
  };
}

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(
  headers: Headers,
  cspMode: CSPMode = 'balanced',
  imageDomains: string[] = []
): void {
  const securityHeaders = getSecurityHeaders(cspMode, imageDomains);
  Object.entries(securityHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });
}
