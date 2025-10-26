import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface MealGenerationRequest {
  pantry_items: string[]
  dietary_preferences?: string[]
  cuisine_type?: string
  meal_type?: string
  serving_size?: number
  tenant_id: string
  user_id: string
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
  usage: {
    total_tokens: number
    prompt_tokens: number
    completion_tokens: number
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the user from the JWT token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(authHeader)
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const requestBody: MealGenerationRequest = await req.json()
    
    // Validate request
    if (!requestBody.pantry_items || !Array.isArray(requestBody.pantry_items)) {
      return new Response(
        JSON.stringify({ error: 'pantry_items array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check user quota
    const { data: quotaCheck } = await supabaseClient.rpc('check_user_quota', {
      user_id_param: user.id,
      action_param: 'meal_generation'
    })

    if (!quotaCheck) {
      return new Response(
        JSON.stringify({ error: 'Daily quota exceeded. Please upgrade your plan.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check for cached response
    const cacheKey = `meal_${JSON.stringify(requestBody).replace(/[^a-zA-Z0-9]/g, '')}`
    const { data: cachedResponse } = await supabaseClient
      .from('ai_cache')
      .select('response_data, tokens_used, cost_usd')
      .eq('cache_key', cacheKey)
      .eq('tenant_id', requestBody.tenant_id)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (cachedResponse) {
      // Log usage for cached response
      await supabaseClient.rpc('log_usage', {
        user_id_param: user.id,
        action_param: 'meal_generation',
        tokens_used_param: cachedResponse.tokens_used,
        cost_usd_param: cachedResponse.cost_usd,
        model_used_param: 'gpt-4-cached',
        metadata_param: { cached: true }
      })

      return new Response(
        JSON.stringify({ 
          data: cachedResponse.response_data,
          cached: true 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate meal using OpenAI
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const prompt = buildMealPrompt(requestBody)
    
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful cooking assistant that generates detailed meal recipes based on available ingredients. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json()
      console.error('OpenAI API Error:', errorData)
      return new Response(
        JSON.stringify({ error: 'Failed to generate meal' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const openaiData: OpenAIResponse = await openaiResponse.json()
    const mealData = JSON.parse(openaiData.choices[0].message.content)

    // Calculate cost (approximate)
    const costPerToken = 0.00003 // GPT-4 pricing
    const totalCost = (openaiData.usage.total_tokens * costPerToken) / 1000

    // Cache the response
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // Cache for 24 hours

    await supabaseClient
      .from('ai_cache')
      .insert({
        tenant_id: requestBody.tenant_id,
        cache_key: cacheKey,
        prompt_hash: btoa(prompt).slice(0, 64),
        response_data: mealData,
        model_used: 'gpt-4',
        tokens_used: openaiData.usage.total_tokens,
        cost_usd: totalCost,
        ttl_seconds: 86400,
        expires_at: expiresAt.toISOString()
      })

    // Log usage
    await supabaseClient.rpc('log_usage', {
      user_id_param: user.id,
      action_param: 'meal_generation',
      tokens_used_param: openaiData.usage.total_tokens,
      cost_usd_param: totalCost,
      model_used_param: 'gpt-4',
      metadata_param: { 
        pantry_items: requestBody.pantry_items.length,
        dietary_preferences: requestBody.dietary_preferences,
        cuisine_type: requestBody.cuisine_type
      }
    })

    // Save recipe to database
    const { data: recipe, error: recipeError } = await supabaseClient
      .from('recipes')
      .insert({
        user_id: user.id,
        title: mealData.title,
        details: mealData,
        calories: mealData.calories || 0,
        time: mealData.cook_time || '30 minutes',
        tenant_id: requestBody.tenant_id
      })
      .select()
      .single()

    if (recipeError) {
      console.error('Error saving recipe:', recipeError)
    }

    // Log recipe metrics
    await supabaseClient
      .from('recipe_metrics')
      .insert({
        recipe_id: recipe?.id,
        user_id: user.id,
        ingredients_used: requestBody.pantry_items,
        cuisine_type: requestBody.cuisine_type || 'general',
        cook_time: mealData.cook_time || '30 minutes',
        calories: mealData.calories || 0,
        api_latency_ms: Date.now() - Date.now(), // This would be calculated properly
        model_used: 'gpt-4',
        tenant_id: requestBody.tenant_id
      })

    return new Response(
      JSON.stringify({ 
        data: mealData,
        recipe_id: recipe?.id,
        usage: {
          tokens: openaiData.usage.total_tokens,
          cost: totalCost
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Meal generation error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function buildMealPrompt(request: MealGenerationRequest): string {
  let prompt = `Generate a detailed meal recipe using these ingredients: ${request.pantry_items.join(', ')}.\n\n`
  
  if (request.dietary_preferences && request.dietary_preferences.length > 0) {
    prompt += `Dietary preferences: ${request.dietary_preferences.join(', ')}\n`
  }
  
  if (request.cuisine_type) {
    prompt += `Cuisine type: ${request.cuisine_type}\n`
  }
  
  if (request.meal_type) {
    prompt += `Meal type: ${request.meal_type}\n`
  }
  
  if (request.serving_size) {
    prompt += `Serving size: ${request.serving_size} people\n`
  }
  
  prompt += `\nPlease respond with a JSON object containing:
  - title: Recipe title
  - description: Brief description
  - ingredients: Array of ingredients with quantities
  - instructions: Array of step-by-step instructions
  - cook_time: Estimated cooking time
  - calories: Estimated calories per serving
  - difficulty: Easy/Medium/Hard
  - tags: Array of relevant tags`

  return prompt
}
