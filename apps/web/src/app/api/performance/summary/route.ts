/**
 * Performance Summary API
 * Returns performance metrics for monitoring
 */

import { NextRequest, NextResponse } from 'next/server';
import { performanceMonitor } from '@/lib/performance/monitor';
import { cache } from '@/lib/performance/cache';
import { successResponse } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  try {
    // Get performance summary
    const summary = performanceMonitor.getSummary();
    
    // Get cache stats
    const cacheStats = cache.getStats();

    return NextResponse.json(successResponse({
      performance: summary,
      cache: cacheStats,
      timestamp: new Date().toISOString(),
    }));
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get performance summary',
        },
      },
      { status: 500 }
    );
  }
}
