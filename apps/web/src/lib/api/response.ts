/**
 * Standardized API Response Utilities
 * Consistent response format across all APIs
 * Measurable: Better DX, easier debugging, consistent error handling
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
    version?: string;
  };
}

/**
 * Create success response
 */
export function successResponse<T>(
  data: T,
  meta?: { requestId?: string; version?: string }
): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
}

/**
 * Create error response
 */
export function errorResponse(
  code: string,
  message: string,
  details?: unknown,
  meta?: { requestId?: string; version?: string }
): ApiResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
}

/**
 * Create paginated response
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  },
  meta?: { requestId?: string; version?: string }
): ApiResponse<{ items: T[]; pagination: typeof pagination }> {
  return {
    success: true,
    data: {
      items: data,
      pagination,
    },
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
}

/**
 * Next.js API route helper
 */
export function jsonResponse<T>(
  response: ApiResponse<T>,
  status: number = 200
): Response {
  return new Response(JSON.stringify(response), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
