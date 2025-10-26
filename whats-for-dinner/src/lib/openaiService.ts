import { openai } from './openaiClient'
import { RecipeSchema } from './validation'
import { z } from 'zod'

interface GenerateRecipesOptions {
  ingredients: string[]
  preferences: string
  maxRetries?: number
  retryDelay?: number
}

interface GenerateRecipesResult {
  recipes: z.infer<typeof RecipeSchema>[]
  metadata: {
    model: string
    timestamp: string
    retryCount: number
  }
}

export async function generateRecipes({
  ingredients,
  preferences,
  maxRetries = 3,
  retryDelay = 1000,
}: GenerateRecipesOptions): Promise<GenerateRecipesResult> {
  let lastError: Error | null = null
  let retryCount = 0

  const prompt = `Suggest three dinner ideas based on these ingredients: ${ingredients.join(', ')}.
  Take into account these dietary preferences: ${preferences || 'No specific preferences'}.
  
  For each recipe, provide:
  - A creative and appetizing title
  - Estimated cook time (e.g., "30 minutes", "1 hour")
  - Approximate calories per serving
  - List of ingredients needed
  - Step-by-step cooking instructions
  
  Format the response as a JSON array of objects with the following structure:
  [
    {
      "title": "Recipe Name",
      "cookTime": "30 minutes",
      "calories": 450,
      "ingredients": ["ingredient1", "ingredient2"],
      "steps": ["step1", "step2", "step3"]
    }
  ]`

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
      })

      const content = completion.choices[0].message.content
      if (!content) {
        throw new Error('No content received from OpenAI')
      }

      // Parse and validate the response
      const rawRecipes = JSON.parse(content)
      const recipes = z.array(RecipeSchema).parse(rawRecipes)

      return {
        recipes,
        metadata: {
          model: "gpt-4o-mini",
          timestamp: new Date().toISOString(),
          retryCount: attempt,
        },
      }
    } catch (error) {
      lastError = error as Error
      retryCount = attempt

      // Log the error for debugging
      console.error(`OpenAI API attempt ${attempt + 1} failed:`, error)

      // Don't retry on validation errors
      if (error instanceof z.ZodError) {
        throw new Error(`Recipe validation failed: ${error.errors.map(e => e.message).join(', ')}`)
      }

      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)))
    }
  }

  // If we get here, all retries failed
  throw new Error(`Failed to generate recipes after ${maxRetries + 1} attempts. Last error: ${lastError?.message}`)
}

export async function generateRecipesWithFallback(
  options: GenerateRecipesOptions
): Promise<GenerateRecipesResult> {
  try {
    return await generateRecipes(options)
  } catch (error) {
    console.error('Primary recipe generation failed, using fallback:', error)
    
    // Fallback: return a simple recipe based on ingredients
    const fallbackRecipes = [{
      title: `Simple ${options.ingredients[0]} Dish`,
      cookTime: '20 minutes',
      calories: 300,
      ingredients: options.ingredients,
      steps: [
        `Prepare ${options.ingredients.join(', ')}`,
        'Heat oil in a pan',
        'Cook ingredients until tender',
        'Season to taste and serve'
      ]
    }]

    return {
      recipes: fallbackRecipes,
      metadata: {
        model: 'fallback',
        timestamp: new Date().toISOString(),
        retryCount: -1,
      },
    }
  }
}