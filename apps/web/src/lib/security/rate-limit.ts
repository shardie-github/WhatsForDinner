/**
 * Rate Limiting Utilities
 * Provides client-side rate limiting for API calls
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  /**
   * Check if request is allowed
   */
  isAllowed(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];

    // Remove old requests outside the window
    const validRequests = requests.filter((timestamp) => now - timestamp < config.windowMs);

    if (validRequests.length >= config.maxRequests) {
      return false;
    }

    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);

    return true;
  }

  /**
   * Get remaining requests
   */
  getRemaining(key: string, config: RateLimitConfig): number {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    const validRequests = requests.filter((timestamp) => now - timestamp < config.windowMs);
    return Math.max(0, config.maxRequests - validRequests.length);
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    this.requests.delete(key);
  }

  /**
   * Clear all rate limits
   */
  clear(): void {
    this.requests.clear();
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Rate-limited fetch wrapper
 */
export async function rateLimitedFetch(
  url: string,
  options?: RequestInit,
  config: RateLimitConfig = { maxRequests: 10, windowMs: 60000 }
): Promise<Response> {
  const key = url.split('?')[0]; // Use URL without query params as key

  if (!rateLimiter.isAllowed(key, config)) {
    throw new Error(`Rate limit exceeded. Try again in ${config.windowMs / 1000} seconds.`);
  }

  return fetch(url, options);
}
