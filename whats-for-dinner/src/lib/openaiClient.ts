import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export interface Recipe {
  title: string
  cookTime: string
  calories: number
  steps: string[]
  ingredients: string[]
}