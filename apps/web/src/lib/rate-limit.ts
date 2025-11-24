/**
 * Rate Limiting Middleware
 * 
 * Provides rate limiting for API routes using in-memory store (suitable for serverless)
 * For production, consider using Redis or Vercel Edge Config
 */

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (request: Request) => string; // Custom key generator
  skipSuccessfulRequests?: boolean; // Skip counting successful requests
  skipFailedRequests?: boolean; // Skip counting failed requests
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store (clears on serverless function restart)
// For production, use Redis or Vercel Edge Config
const store: RateLimitStore = {};

// Cleanup old entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    Object.keys(store).forEach((key) => {
      if (store[key].resetTime < now) {
        delete store[key];
      }
    });
  }, 5 * 60 * 1000);
}

function getClientIdentifier(request: Request): string {
  // Try to get IP from various headers (Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  
  const ip = forwarded?.split(',')[0] || realIp || cfConnectingIp || 'unknown';
  
  // For authenticated users, use user ID instead of IP
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    // Extract user ID from JWT or session (simplified)
    // In production, decode JWT to get user ID
    return `user:${authHeader.substring(0, 20)}`;
  }
  
  return `ip:${ip}`;
}

export function createRateLimiter(config: RateLimitConfig) {
  const {
    windowMs = 60 * 1000, // 1 minute default
    maxRequests = 100, // 100 requests per window default
    keyGenerator = getClientIdentifier,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = config;

  return async (request: Request): Promise<{ allowed: boolean; remaining: number; resetTime: number }> => {
    const key = keyGenerator(request);
    const now = Date.now();
    
    // Get or create entry
    let entry = store[key];
    
    if (!entry || entry.resetTime < now) {
      // Create new window
      entry = {
        count: 0,
        resetTime: now + windowMs,
      };
      store[key] = entry;
    }
    
    // Increment count
    entry.count++;
    
    const remaining = Math.max(0, maxRequests - entry.count);
    const allowed = entry.count <= maxRequests;
    
    return {
      allowed,
      remaining,
      resetTime: entry.resetTime,
    };
  };
}

// Pre-configured rate limiters
export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
});

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 login attempts per 15 minutes
});

export const generateRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 meal generations per minute
});

/**
 * Rate limit middleware for Next.js API routes
 */
export async function withRateLimit(
  request: Request,
  limiter = apiRateLimiter,
  handler: (request: Request) => Promise<Response>
): Promise<Response> {
  const result = await limiter(request);
  
  if (!result.allowed) {
    return new Response(
      JSON.stringify({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.resetTime.toString(),
          'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
        },
      }
    );
  }
  
  try {
    const response = await handler(request);
    
    // Add rate limit headers to response
    response.headers.set('X-RateLimit-Limit', '100');
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', result.resetTime.toString());
    
    return response;
  } catch (error) {
    // Re-throw error (don't count failed requests if configured)
    throw error;
  }
}
