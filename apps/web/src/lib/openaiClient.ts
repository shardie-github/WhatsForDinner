import OpenAI from 'openai';
import { validateEnv } from './validation';

// Validate environment variables on startup
try {
  validateEnv();
} catch (error) {
  // Error handled: Environment validation failed:
  throw error;
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-test-mock-key',
});

// Re-export Recipe type from validation
export type { Recipe } from './validation';
