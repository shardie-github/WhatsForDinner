import OpenAI from 'openai'
import { validateEnv } from './validation'

// Validate environment variables on startup
try {
  validateEnv()
} catch (error) {
  console.error('Environment validation failed:', error)
  throw error
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

// Re-export Recipe type from validation
export type { Recipe } from './validation'