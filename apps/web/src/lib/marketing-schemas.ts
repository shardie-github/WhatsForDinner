/**
 * Marketing Automation Validation Schemas
 * 
 * Zod schemas for validating marketing campaign data and email operations.
 */

import { z } from 'zod';
import { CommonSchemas } from './validation-guards';

export const EmailTemplateSchema = z.object({
  id: CommonSchemas.uuid,
  name: CommonSchemas.nonEmptyString.max(100, 'Template name too long'),
  subject: CommonSchemas.nonEmptyString.max(200, 'Subject too long'),
  html: z.string().max(50000, 'HTML content too long'),
  text: z.string().max(10000, 'Text content too long'),
  trigger: z.enum(['signup', 'first_recipe', 'milestone', 'churn_risk', 'winback']),
  delay_hours: z.number().int().nonnegative().max(168).optional(), // Max 1 week
  conditions: z.record(z.unknown()).optional(),
});

export const EmailCampaignSchema = z.object({
  id: CommonSchemas.uuid,
  name: CommonSchemas.nonEmptyString.max(200, 'Campaign name too long'),
  template_id: CommonSchemas.uuid,
  status: z.enum(['draft', 'scheduled', 'running', 'paused', 'completed']),
  target_audience: z.object({
    user_segments: z.array(CommonSchemas.nonEmptyString).max(50, 'Too many segments'),
    tenant_ids: z.array(CommonSchemas.uuid).max(100, 'Too many tenants'),
    conditions: z.record(z.unknown()).optional(),
  }),
  schedule: z.object({
    start_date: CommonSchemas.isoDate,
    end_date: CommonSchemas.isoDate.optional(),
    timezone: z.string().max(50, 'Timezone too long'),
  }),
  metrics: z.object({
    sent: z.number().int().nonnegative(),
    delivered: z.number().int().nonnegative(),
    opened: z.number().int().nonnegative(),
    clicked: z.number().int().nonnegative(),
    converted: z.number().int().nonnegative(),
  }).optional(),
});

export const SendEmailSchema = z.object({
  userEmail: CommonSchemas.email,
  userName: CommonSchemas.nonEmptyString.max(100, 'Name too long'),
  referralCode: z.string().max(50, 'Referral code too long').optional(),
});

export const SendRecipeEmailSchema = z.object({
  userEmail: CommonSchemas.email,
  userName: CommonSchemas.nonEmptyString.max(100, 'Name too long'),
  recipeTitle: CommonSchemas.nonEmptyString.max(200, 'Recipe title too long'),
});

export type ValidatedEmailTemplate = z.infer<typeof EmailTemplateSchema>;
export type ValidatedEmailCampaign = z.infer<typeof EmailCampaignSchema>;
export type ValidatedSendEmail = z.infer<typeof SendEmailSchema>;
export type ValidatedSendRecipeEmail = z.infer<typeof SendRecipeEmailSchema>;
