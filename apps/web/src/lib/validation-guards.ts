/**
 * Validation Guards
 * 
 * Input validation utilities using Zod schemas with consistent error handling.
 * Provides type-safe validation with automatic error conversion to AppError.
 */

import { z } from 'zod';
import { ValidationError, type ErrorDetails } from './errors';

/**
 * Validate input against a Zod schema and throw ValidationError on failure
 * 
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @param context - Optional context for error messages (e.g., "user registration")
 * @returns Validated data with proper TypeScript type
 * @throws ValidationError if validation fails
 * 
 * @example
 * ```ts
 * const UserSchema = z.object({
 *   email: z.string().email(),
 *   name: z.string().min(1),
 * });
 * 
 * const user = validateInput(UserSchema, req.body, 'user creation');
 * // user is typed as { email: string; name: string }
 * ```
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context?: string
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details: ErrorDetails = {
        errors: error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code,
        })),
        context,
      };

      throw new ValidationError(
        `Invalid input${context ? ` in ${context}` : ''}`,
        details
      );
    }
    throw error;
  }
}

/**
 * Validate input and return result object instead of throwing
 * Useful when you want to handle validation errors gracefully
 * 
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Object with success flag and data or error
 * 
 * @example
 * ```ts
 * const result = validateInputSafe(UserSchema, req.body);
 * if (!result.success) {
 *   return res.status(400).json({ errors: result.error });
 * }
 * const user = result.data; // Typed correctly
 * ```
 */
export function validateInputSafe<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Validate optional input (returns undefined if input is null/undefined)
 * 
 * @param schema - Zod schema to validate against
 * @param data - Data to validate (can be null/undefined)
 * @param context - Optional context for error messages
 * @returns Validated data or undefined
 * @throws ValidationError if validation fails (when data is provided)
 */
export function validateOptionalInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context?: string
): T | undefined {
  if (data === null || data === undefined) {
    return undefined;
  }
  return validateInput(schema, data, context);
}

/**
 * Common validation schemas for reuse
 */
export const CommonSchemas = {
  /** UUID v4 validation */
  uuid: z.string().uuid('Invalid UUID format'),

  /** Email validation */
  email: z.string().email('Invalid email format'),

  /** Non-empty string */
  nonEmptyString: z.string().min(1, 'String cannot be empty'),

  /** Positive integer */
  positiveInt: z.number().int().positive('Must be a positive integer'),

  /** Non-negative integer */
  nonNegativeInt: z.number().int().nonnegative('Must be a non-negative integer'),

  /** ISO 8601 date string */
  isoDate: z.string().datetime('Invalid ISO 8601 date format'),

  /** URL validation */
  url: z.string().url('Invalid URL format'),

  /** Pagination parameters */
  pagination: z.object({
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(20),
  }),
} as const;
