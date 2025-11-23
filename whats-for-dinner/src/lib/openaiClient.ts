import OpenAI from 'openai';
import { validateEnv } from './validation';
import { createComponentLogger } from '@whats-for-dinner/utils';

// Validate environment variables on startup
try {
  validateEnv();
} catch (error) {
  logger.error('Environment validation failed:', { error });
  throw error;
}

const logger = createComponentLogger('openaiclient-ts');
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Re-export Recipe type from validation
export type { Recipe } from './validation';
