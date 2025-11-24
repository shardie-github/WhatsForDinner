/**
 * API Versioning Strategy
 * 
 * Provides API versioning utilities for backward compatibility
 */

export const API_VERSION_HEADER = 'X-API-Version';
export const DEFAULT_API_VERSION = 'v1';

export type ApiVersion = 'v1' | 'v2';

export interface VersionedHandler {
  v1?: (request: Request) => Promise<Response>;
  v2?: (request: Request) => Promise<Response>;
}

/**
 * Extract API version from request
 */
export function getApiVersion(request: Request): ApiVersion {
  // Check header first
  const headerVersion = request.headers.get(API_VERSION_HEADER);
  if (headerVersion && (headerVersion === 'v1' || headerVersion === 'v2')) {
    return headerVersion;
  }
  
  // Check URL path
  const url = new URL(request.url);
  const pathMatch = url.pathname.match(/\/api\/(v\d+)\//);
  if (pathMatch) {
    const version = pathMatch[1] as ApiVersion;
    if (version === 'v1' || version === 'v2') {
      return version;
    }
  }
  
  // Default to v1
  return DEFAULT_API_VERSION as ApiVersion;
}

/**
 * Route handler with versioning support
 */
export function createVersionedHandler(handlers: VersionedHandler) {
  return async (request: Request): Promise<Response> => {
    const version = getApiVersion(request);
    
    const handler = handlers[version];
    if (!handler) {
      return new Response(
        JSON.stringify({
          error: 'Unsupported API Version',
          message: `API version ${version} is not supported`,
          supportedVersions: Object.keys(handlers),
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'X-Supported-Versions': Object.keys(handlers).join(', '),
          },
        }
      );
    }
    
    return handler(request);
  };
}

/**
 * Middleware to add version headers to response
 */
export function withVersionHeaders(
  handler: (request: Request) => Promise<Response>
): (request: Request) => Promise<Response> {
  return async (request: Request): Promise<Response> => {
    const version = getApiVersion(request);
    const response = await handler(request);
    
    response.headers.set(API_VERSION_HEADER, version);
    response.headers.set('X-Supported-Versions', 'v1,v2');
    
    return response;
  };
}

/**
 * Example usage:
 * 
 * ```typescript
 * export const GET = createVersionedHandler({
 *   v1: async (request) => {
 *     // v1 implementation
 *     return Response.json({ data: 'v1 response' });
 *   },
 *   v2: async (request) => {
 *     // v2 implementation
 *     return Response.json({ data: 'v2 response' });
 *   },
 * });
 * ```
 */
