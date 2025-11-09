/**
 * API Input Validation
 * Zod-based validation for API route inputs
 * 
 * Usage:
 * ```typescript
 * import { validateRequest } from '@/lib/validation/api-validator';
 * import { z } from 'zod';
 * 
 * const schema = z.object({
 *   userId: z.string().uuid(),
 *   limit: z.number().int().min(1).max(100).optional(),
 * });
 * 
 * export const GET = async (req: NextRequest) => {
 *   const params = await validateRequest(req, schema);
 *   // params is typed and validated
 * };
 * ```
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ValidationError } from '../errors';

/**
 * Validate request query parameters
 */
export async function validateQuery<T extends z.ZodType>(
  req: NextRequest,
  schema: T
): Promise<z.infer<T>> {
  const url = new URL(req.url);
  const params = Object.fromEntries(url.searchParams.entries());
  
  try {
    return schema.parse(params);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Invalid query parameters', {
        errors: error.errors,
        field: 'query',
      });
    }
    throw error;
  }
}

/**
 * Validate request body (JSON)
 */
export async function validateBody<T extends z.ZodType>(
  req: NextRequest,
  schema: T
): Promise<z.infer<T>> {
  try {
    const body = await req.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Invalid request body', {
        errors: error.errors,
        field: 'body',
      });
    }
    if (error instanceof SyntaxError) {
      throw new ValidationError('Invalid JSON in request body', {
        field: 'body',
      });
    }
    throw error;
  }
}

/**
 * Validate request (query or body based on method)
 */
export async function validateRequest<T extends z.ZodType>(
  req: NextRequest,
  schema: T,
  options?: { source?: 'query' | 'body' }
): Promise<z.infer<T>> {
  const source = options?.source ?? (req.method === 'GET' ? 'query' : 'body');
  
  if (source === 'query') {
    return validateQuery(req, schema);
  } else {
    return validateBody(req, schema);
  }
}
