/**
 * Revenue System Validation
 * Input validation for all revenue APIs
 */

import { z } from 'zod';

export const affiliateRegisterSchema = z.object({
  userId: z.string().uuid().optional(),
});

export const affiliateTrackSchema = z.object({
  affiliateCode: z.string().min(1),
  referralId: z.string().optional(),
  productId: z.string().optional(),
});

export const affiliateConvertSchema = z.object({
  orderId: z.string().min(1),
  amount: z.number().positive(),
  userId: z.string().uuid().optional(),
});

export const apiKeyCreateSchema = z.object({
  planId: z.enum(['free', 'starter', 'professional', 'enterprise']),
});

export const marketplacePurchaseSchema = z.object({
  productId: z.string().min(1),
  sellerId: z.string().uuid(),
  amount: z.number().positive(),
  buyerId: z.string().uuid().optional(),
});

export const dataInsightPurchaseSchema = z.object({
  packageId: z.string().min(1),
  buyerId: z.string().min(1),
});

export const enableMonetizationSchema = z.object({
  channels: z.array(z.enum(['affiliate', 'api', 'data', 'marketplace', 'upsells'])),
});

export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Validation failed' };
  }
}
