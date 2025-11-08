/**
 * Caching Utilities
 * 
 * Provides Redis-based caching with in-memory fallback for improved performance.
 */

import { RedisClientType } from 'redis';

// In-memory cache fallback
const memoryCache = new Map<string, { value: any; expires: number }>();

// Cleanup expired entries periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of memoryCache.entries()) {
      if (entry.expires < now) {
        memoryCache.delete(key);
      }
    }
  }, 60000); // Clean up every minute
}

let redisClient: RedisClientType | null = null;

/**
 * Get Redis client (lazy initialization)
 */
async function getRedisClient(): Promise<RedisClientType | null> {
  if (redisClient) {
    return redisClient;
  }
  
  try {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      return null;
    }

    const { createClient } = await import('redis');
    redisClient = createClient({ url: redisUrl }) as RedisClientType;
    
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    
    redisClient.on('error', (err) => {
      console.error('Redis client error:', err);
      redisClient = null;
    });
    
    return redisClient;
  } catch (error) {
    console.warn('Redis not available, using in-memory cache:', error);
    return null;
  }
}

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
}

/**
 * Get value from cache
 */
export async function get<T>(key: string): Promise<T | null> {
  const redis = await getRedisClient();
  
  if (redis) {
    try {
      const value = await redis.get(key);
      if (value) {
        return JSON.parse(value) as T;
      }
      return null;
    } catch (error) {
      console.error('Redis get error:', error);
      // Fall through to memory cache
    }
  }
  
  // Fallback to memory cache
  const entry = memoryCache.get(key);
  if (entry && entry.expires > Date.now()) {
    return entry.value as T;
  }
  
  if (entry) {
    memoryCache.delete(key);
  }
  
  return null;
}

/**
 * Set value in cache
 */
export async function set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
  const redis = await getRedisClient();
  const ttl = options.ttl || 3600; // Default 1 hour
  
  if (redis) {
    try {
      const serialized = JSON.stringify(value);
      await redis.setEx(key, ttl, serialized);
      
      // Store tags if provided
      if (options.tags && options.tags.length > 0) {
        for (const tag of options.tags) {
          await redis.sAdd(`cache:tag:${tag}`, key);
          await redis.expire(`cache:tag:${tag}`, ttl);
        }
      }
      
      return;
    } catch (error) {
      console.error('Redis set error:', error);
      // Fall through to memory cache
    }
  }
  
  // Fallback to memory cache
  memoryCache.set(key, {
    value,
    expires: Date.now() + (ttl * 1000),
  });
}

/**
 * Delete value from cache
 */
export async function del(key: string): Promise<void> {
  const redis = await getRedisClient();
  
  if (redis) {
    try {
      await redis.del(key);
      return;
    } catch (error) {
      console.error('Redis del error:', error);
      // Fall through to memory cache
    }
  }
  
  // Fallback to memory cache
  memoryCache.delete(key);
}

/**
 * Invalidate cache by tag
 */
export async function invalidateTag(tag: string): Promise<void> {
  const redis = await getRedisClient();
  
  if (redis) {
    try {
      const keys = await redis.sMembers(`cache:tag:${tag}`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      await redis.del(`cache:tag:${tag}`);
      return;
    } catch (error) {
      console.error('Redis tag invalidation error:', error);
    }
  }
  
  // Memory cache doesn't support tags, so we can't invalidate by tag
  // This is a limitation of the fallback
}

/**
 * Clear all cache
 */
export async function clear(): Promise<void> {
  const redis = await getRedisClient();
  
  if (redis) {
    try {
      await redis.flushAll();
      return;
    } catch (error) {
      console.error('Redis clear error:', error);
    }
  }
  
  // Fallback to memory cache
  memoryCache.clear();
}

/**
 * Cache decorator for async functions
 */
export function cached<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string,
  options: CacheOptions = {}
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const key = keyGenerator(...args);
    const cached = await get<ReturnType<T>>(key);
    
    if (cached !== null) {
      return cached;
    }
    
    const result = await fn(...args);
    await set(key, result, options);
    
    return result;
  }) as T;
}
