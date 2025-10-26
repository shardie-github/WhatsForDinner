import { NextResponse } from "next/server"
import { z } from "zod"
import { GenerateRecipesRequestSchema } from "@/lib/validation"
import { generateRecipesWithFallback } from "@/lib/openaiService"

export async function POST(req: Request) {
  try {
    // Validate request body
    const body = await req.json()
    const { ingredients, preferences } = GenerateRecipesRequestSchema.parse(body)
    
    // Generate recipes with retry logic and fallback
    const result = await generateRecipesWithFallback({
      ingredients,
      preferences,
      maxRetries: 3,
      retryDelay: 1000,
    })

    return NextResponse.json({
      recipes: result.recipes,
      metadata: result.metadata,
    })
  } catch (error) {
    console.error('Error generating recipes:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to generate recipes' },
      { status: 500 }
    )
  }
}