/**
 * Hydrogen/Oxygen Bridge
 * This file enables compatibility with Shopify's Hydrogen/Oxygen platform
 */

export interface HydrogenRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
}

export interface HydrogenResponse {
  status: number;
  headers: Record<string, string>;
  body: string;
}

export interface HydrogenContext {
  request: HydrogenRequest;
  response: HydrogenResponse;
  params: Record<string, string>;
  query: Record<string, string>;
}

/**
 * Handle Hydrogen/Oxygen requests
 */
export function handleHydrogenRequest(request: HydrogenRequest): HydrogenResponse {
  try {
    // Parse the request
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method.toUpperCase();

    // Route to appropriate handler
    switch (path) {
      case '/api/health':
        return handleHealthCheck(request);
      
      case '/api/ai/search':
        return handleAISearch(request);
      
      case '/api/ai/embeddings':
        return handleEmbeddings(request);
      
      case '/api/ai/insights':
        return handleInsights(request);
      
      default:
        return handleDefault(request);
    }
  } catch (error) {
    console.error('Hydrogen request handling error:', error);
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
}

/**
 * Handle health check requests
 */
function handleHealthCheck(request: HydrogenRequest): HydrogenResponse {
  return {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'hydrogen-oxygen-bridge',
      version: '1.0.0'
    })
  };
}

/**
 * Handle AI search requests
 */
function handleAISearch(request: HydrogenRequest): HydrogenResponse {
  // This would integrate with the Supabase Edge Function
  return {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'AI search endpoint available',
      endpoint: '/functions/search-ai',
      method: 'POST'
    })
  };
}

/**
 * Handle embeddings requests
 */
function handleEmbeddings(request: HydrogenRequest): HydrogenResponse {
  return {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Embeddings generation available',
      endpoint: '/api/ai/embeddings',
      method: 'POST'
    })
  };
}

/**
 * Handle insights requests
 */
function handleInsights(request: HydrogenRequest): HydrogenResponse {
  return {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'AI insights available',
      endpoint: '/api/ai/insights',
      method: 'GET'
    })
  };
}

/**
 * Handle default requests
 */
function handleDefault(request: HydrogenRequest): HydrogenResponse {
  return {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      error: 'Not Found',
      message: `Endpoint ${request.method} ${new URL(request.url).pathname} not found`,
      availableEndpoints: [
        'GET /api/health',
        'POST /api/ai/search',
        'POST /api/ai/embeddings',
        'GET /api/ai/insights'
      ]
    })
  };
}

/**
 * Middleware for Hydrogen/Oxygen compatibility
 */
export function hydrogenMiddleware(handler: (context: HydrogenContext) => Promise<HydrogenResponse>) {
  return async (request: HydrogenRequest): Promise<HydrogenResponse> => {
    try {
      // Create context
      const context: HydrogenContext = {
        request,
        response: {
          status: 200,
          headers: {},
          body: ''
        },
        params: {},
        query: {}
      };

      // Call the handler
      const response = await handler(context);
      
      return response;
    } catch (error) {
      console.error('Hydrogen middleware error:', error);
      return {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Internal Server Error',
          message: error instanceof Error ? error.message : 'Unknown error'
        })
      };
    }
  };
}

/**
 * Utility functions for Hydrogen/Oxygen compatibility
 */
export const hydrogenUtils = {
  /**
   * Parse request body
   */
  parseBody(request: HydrogenRequest): any {
    try {
      return request.body ? JSON.parse(request.body) : {};
    } catch (error) {
      return {};
    }
  },

  /**
   * Get query parameters
   */
  getQueryParams(request: HydrogenRequest): Record<string, string> {
    const url = new URL(request.url);
    const params: Record<string, string> = {};
    
    url.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    
    return params;
  },

  /**
   * Get request headers
   */
  getHeaders(request: HydrogenRequest): Record<string, string> {
    return request.headers;
  },

  /**
   * Create response
   */
  createResponse(data: any, status: number = 200, headers: Record<string, string> = {}): HydrogenResponse {
    return {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify(data)
    };
  },

  /**
   * Create error response
   */
  createErrorResponse(error: string, status: number = 400): HydrogenResponse {
    return {
      status,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error, status })
    };
  }
};

/**
 * Export for Hydrogen/Oxygen compatibility
 */
export default {
  handleHydrogenRequest,
  hydrogenMiddleware,
  hydrogenUtils
};