/**
 * Performance Monitoring
 * 
 * Tracks and reports performance metrics for API routes and pages
 */

interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  tags?: Record<string, string>;
  timestamp: number;
}

const metrics: PerformanceMetric[] = [];

// Export metrics for external monitoring systems
export function getMetrics(): PerformanceMetric[] {
  return [...metrics];
}

export function clearMetrics(): void {
  metrics.length = 0;
}

/**
 * Track API route performance
 */
export function trackApiPerformance(
  route: string,
  duration: number,
  statusCode: number,
  method: string
): void {
  const metric: PerformanceMetric = {
    name: 'api.request.duration',
    value: duration,
    unit: 'ms',
    tags: {
      route,
      method,
      status: statusCode.toString(),
      statusClass: getStatusClass(statusCode),
    },
    timestamp: Date.now(),
  };
  
  metrics.push(metric);
  
  // Log slow requests
  if (duration > 1000) {
    console.warn(`Slow API request: ${method} ${route} took ${duration}ms`);
  }
  
  // Send to external monitoring (Sentry, etc.)
  if (typeof window === 'undefined' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    // In server context, could send to Sentry or other monitoring
    // This is a placeholder for actual monitoring integration
  }
}

function getStatusClass(statusCode: number): string {
  if (statusCode >= 200 && statusCode < 300) return '2xx';
  if (statusCode >= 300 && statusCode < 400) return '3xx';
  if (statusCode >= 400 && statusCode < 500) return '4xx';
  if (statusCode >= 500) return '5xx';
  return 'unknown';
}

/**
 * Track database query performance
 */
export function trackDbQuery(
  query: string,
  duration: number,
  rows?: number
): void {
  const metric: PerformanceMetric = {
    name: 'db.query.duration',
    value: duration,
    unit: 'ms',
    tags: {
      query: query.substring(0, 50), // Truncate long queries
      rows: rows?.toString() || 'unknown',
    },
    timestamp: Date.now(),
  };
  
  metrics.push(metric);
  
  // Log slow queries
  if (duration > 500) {
    console.warn(`Slow DB query: ${query.substring(0, 100)} took ${duration}ms`);
  }
}

/**
 * Track page load performance
 */
export function trackPageLoad(
  page: string,
  duration: number,
  metrics: {
    fcp?: number; // First Contentful Paint
    lcp?: number; // Largest Contentful Paint
    fid?: number; // First Input Delay
    cls?: number; // Cumulative Layout Shift
    ttfb?: number; // Time to First Byte
  }
): void {
  const pageMetric: PerformanceMetric = {
    name: 'page.load.duration',
    value: duration,
    unit: 'ms',
    tags: {
      page,
    },
    timestamp: Date.now(),
  };
  
  const webVitals: PerformanceMetric[] = [
    pageMetric,
    ...Object.entries(metrics)
      .filter(([_, value]) => value !== undefined)
      .map(([name, value]) => ({
        name: `web.vital.${name}`,
        value: value!,
        unit: 'ms' as const,
        tags: { page },
        timestamp: Date.now(),
      })),
  ];
  
  webVitals.forEach((m) => {
    // Send to analytics (PostHog, etc.)
    if (typeof window !== 'undefined') {
      // Client-side tracking
      if ((window as any).posthog) {
        (window as any).posthog.capture('web_vital', {
          metric: m.name,
          value: m.value,
          page: m.tags?.page,
        });
      }
    }
  });
}

/**
 * Performance monitoring middleware for API routes
 */
export function withPerformanceMonitoring<T>(
  handler: (request: Request) => Promise<Response>,
  routeName: string
): (request: Request) => Promise<Response> {
  return async (request: Request): Promise<Response> => {
    const startTime = Date.now();
    const method = request.method;
    
    try {
      const response = await handler(request);
      const duration = Date.now() - startTime;
      
      trackApiPerformance(routeName, duration, response.status, method);
      
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      trackApiPerformance(routeName, duration, 500, method);
      
      throw error;
    }
  };
}

/**
 * Get performance summary
 */
export function getPerformanceSummary(): {
  apiRequests: {
    total: number;
    avgDuration: number;
    p95Duration: number;
    p99Duration: number;
    errors: number;
  };
  dbQueries: {
    total: number;
    avgDuration: number;
    slowQueries: number;
  };
} {
  const apiMetrics = metrics.filter((m) => m.name === 'api.request.duration');
  const dbMetrics = metrics.filter((m) => m.name === 'db.query.duration');
  
  const apiDurations = apiMetrics.map((m) => m.value).sort((a, b) => a - b);
  const dbDurations = dbMetrics.map((m) => m.value).sort((a, b) => a - b);
  
  return {
    apiRequests: {
      total: apiMetrics.length,
      avgDuration: apiDurations.length > 0
        ? apiDurations.reduce((a, b) => a + b, 0) / apiDurations.length
        : 0,
      p95Duration: apiDurations.length > 0
        ? apiDurations[Math.floor(apiDurations.length * 0.95)]
        : 0,
      p99Duration: apiDurations.length > 0
        ? apiDurations[Math.floor(apiDurations.length * 0.99)]
        : 0,
      errors: apiMetrics.filter((m) => m.tags?.statusClass === '5xx').length,
    },
    dbQueries: {
      total: dbMetrics.length,
      avgDuration: dbDurations.length > 0
        ? dbDurations.reduce((a, b) => a + b, 0) / dbDurations.length
        : 0,
      slowQueries: dbDurations.filter((d) => d > 500).length,
    },
  };
}
