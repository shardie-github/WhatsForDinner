import { NextResponse } from "next/server"
import { openai, Recipe } from "@/lib/openaiClient"

export async function POST(req: Request) {
  try {
    const { ingredients, preferences } = await req.json()
    
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

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    })

    const content = completion.choices[0].message.content
    const recipes = JSON.parse(content || '[]') as Recipe[]

    return NextResponse.json({ recipes })
  } catch (error) {
    console.error('Error generating recipes:', error)
    return NextResponse.json(
      { error: 'Failed to generate recipes' },
      { status: 500 }
    )
  }
}