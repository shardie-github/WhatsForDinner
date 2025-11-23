import { createComponentLogger } from '@whats-for-dinner/utils';

const logger = createComponentLogger('db-optimization');

/**
 * Database Query Optimization Utilities
 * 
 * Provides utilities for optimizing database queries, including query caching,
 * connection pooling, and query analysis.
 */

import { createClient } from '@supabase/supabase-js';
import { get } from './cache';

// Query cache TTL (5 minutes default)
const QUERY_CACHE_TTL = parseInt(process.env.QUERY_CACHE_TTL || '300', 10);

/**
 * Optimized Supabase query with caching
 */
export async function cachedQuery<T>(
  cacheKey: string,
  queryFn: () => Promise<T>,
  options: { ttl?: number; tags?: string[] } = {}
): Promise<T> {
  // Try to get from cache first
  const cached = await get<T>(cacheKey);
  if (cached !== null) {
    return cached;
  }
  
  // Execute query
  const result = await queryFn();
  
  // Cache result
  const { set } = await import('./cache');
  await set(cacheKey, result, {
    ttl: options.ttl || QUERY_CACHE_TTL,
    tags: options.tags,
  });
  
  return result;
}

/**
 * Pagination helper with cursor-based pagination for better performance
 */
export interface PaginationOptions {
  limit?: number;
  cursor?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

/**
 * Execute paginated query with cursor-based pagination
 */
export async function paginatedQuery<T>(
  queryFn: (options: PaginationOptions) => Promise<{ data: T[] | null; error: any }>,
  options: PaginationOptions = {}
): Promise<PaginatedResult<T>> {
  const limit = Math.min(options.limit || 20, 100); // Max 100 items per page
  const orderBy = options.orderBy || 'created_at';
  const orderDirection = options.orderDirection || 'desc';
  
  const queryOptions: PaginationOptions = {
    ...options,
    limit,
    orderBy,
    orderDirection,
  };
  
  const { data, error } = await queryFn(queryOptions);
  
  if (error) {
    throw new Error(`Query failed: ${error.message}`);
  }
  
  const items = data || [];
  const hasMore = items.length === limit;
  const nextCursor = hasMore && items.length > 0
    ? (items[items.length - 1] as any)[orderBy]?.toString() || null
    : null;
  
  return {
    data: items,
    nextCursor,
    hasMore,
  };
}

/**
 * Batch query helper to reduce database round trips
 */
export async function batchQuery<T, R>(
  items: T[],
  batchSize: number,
  queryFn: (batch: T[]) => Promise<R[]>
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await queryFn(batch);
    results.push(...batchResults);
  }
  
  return results;
}

/**
 * Query performance monitoring
 */
export interface QueryMetrics {
  query: string;
  duration: number;
  rowCount?: number;
  cached: boolean;
}

const queryMetrics: QueryMetrics[] = [];

export function recordQueryMetrics(metrics: QueryMetrics): void {
  queryMetrics.push(metrics);
  
  // Keep only last 1000 metrics
  if (queryMetrics.length > 1000) {
    queryMetrics.shift();
  }
  
  // Log slow queries (> 100ms)
  if (metrics.duration > 100) {
    logger.warn('Slow query detected: ${metrics.query} took ${metrics.duration}ms');
  }
}

export function getQueryMetrics(): QueryMetrics[] {
  return [...queryMetrics];
}

export function getAverageQueryTime(): number {
  if (queryMetrics.length === 0) {
    return 0;
  }
  
  const total = queryMetrics.reduce((sum, m) => sum + m.duration, 0);
  return total / queryMetrics.length;
}

/**
 * Optimize Supabase query with select only needed columns
 */
export function selectColumns<T extends Record<string, any>>(
  columns: (keyof T)[]
): string {
  return columns.join(', ');
}

/**
 * Common query optimizations
 */
export const queryOptimizations = {
  // Use select() to limit columns
  selectOnly: <T extends Record<string, any>>(columns: (keyof T)[]) => 
    columns.join(', '),
  
  // Use limit() to restrict results
  limit: (count: number) => Math.min(count, 100),
  
  // Use range() for pagination
  range: (from: number, to: number) => ({
    from: Math.max(0, from),
    to: Math.max(from, to),
  }),
  
  // Use order() with index-friendly columns
  order: (column: string, ascending: boolean = false) => ({
    column,
    ascending,
  }),
};
