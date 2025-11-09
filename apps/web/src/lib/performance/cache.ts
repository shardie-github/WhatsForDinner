/**
 * Request Caching Utilities
 * Provides caching strategies for API requests and data
 */

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  key?: string; // Custom cache key
  staleWhileRevalidate?: boolean; // Return stale data while revalidating
}

class CacheManager {
  private cache: Map<string, { data: unknown; expires: number; timestamp: number }> = new Map();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get cached value
   */
  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expires) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  /**
   * Set cached value
   */
  set<T>(key: string, value: T, ttl?: number): void {
    const expires = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, {
      data: value,
      expires,
      timestamp: Date.now(),
    });
  }

  /**
   * Delete cached value
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    if (Date.now() > cached.expires) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const cache = new CacheManager();

/**
 * Cached fetch wrapper
 */
export async function cachedFetch<T>(
  url: string,
  options?: RequestInit & { cache?: CacheOptions }
): Promise<T> {
  const cacheKey = options?.cache?.key || url;
  const cached = cache.get<T>(cacheKey);

  if (cached && !options?.cache?.staleWhileRevalidate) {
    return cached;
  }

  const fetchPromise = fetch(url, options).then((res) => res.json() as Promise<T>);

  if (cached && options?.cache?.staleWhileRevalidate) {
    // Return stale data immediately, update cache in background
    fetchPromise.then((data) => {
      cache.set(cacheKey, data, options?.cache?.ttl);
    });
    return cached;
  }

  const data = await fetchPromise;
  cache.set(cacheKey, data, options?.cache?.ttl);
  return data;
}
