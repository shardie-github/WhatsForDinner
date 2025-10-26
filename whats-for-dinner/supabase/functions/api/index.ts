import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface Database {
  public: {
    Tables: {
      pantry_items: {
        Row: {
          id: number
          user_id: string
          ingredient: string
          quantity: number
          tenant_id: string
        }
        Insert: {
          id?: number
          user_id: string
          ingredient: string
          quantity?: number
          tenant_id: string
        }
        Update: {
          id?: number
          user_id?: string
          ingredient?: string
          quantity?: number
          tenant_id?: string
        }
      }
      recipes: {
        Row: {
          id: number
          user_id: string
          title: string
          details: any
          calories: number
          time: string
          tenant_id: string
        }
        Insert: {
          id?: number
          user_id: string
          title: string
          details?: any
          calories?: number
          time?: string
          tenant_id: string
        }
        Update: {
          id?: number
          user_id?: string
          title?: string
          details?: any
          calories?: number
          time?: string
          tenant_id?: string
        }
      }
      favorites: {
        Row: {
          id: number
          user_id: string
          recipe_id: number
          tenant_id: string
        }
        Insert: {
          id?: number
          user_id: string
          recipe_id: number
          tenant_id: string
        }
        Update: {
          id?: number
          user_id?: string
          recipe_id?: number
          tenant_id?: string
        }
      }
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the user from the JWT token
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url)
    const path = url.pathname
    const method = req.method

    // Route handling
    if (path.startsWith('/pantry')) {
      return await handlePantryRoutes(supabaseClient, user.id, method, path, req)
    } else if (path.startsWith('/recipes')) {
      return await handleRecipeRoutes(supabaseClient, user.id, method, path, req)
    } else if (path.startsWith('/favorites')) {
      return await handleFavoriteRoutes(supabaseClient, user.id, method, path, req)
    } else {
      return new Response(
        JSON.stringify({ error: 'Not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    console.error('API Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function handlePantryRoutes(supabaseClient: any, userId: string, method: string, path: string, req: Request) {
  if (method === 'GET') {
    // Get pantry items
    const { data, error } = await supabaseClient
      .from('pantry_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } else if (method === 'POST') {
    // Add pantry item
    const body = await req.json()
    const { data, error } = await supabaseClient
      .from('pantry_items')
      .insert({
        user_id: userId,
        ingredient: body.ingredient,
        quantity: body.quantity || 1,
        tenant_id: body.tenant_id
      })
      .select()

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ data: data[0] }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } else if (method === 'DELETE') {
    // Delete pantry item
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    
    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Item ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { error } = await supabaseClient
      .from('pantry_items')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleRecipeRoutes(supabaseClient: any, userId: string, method: string, path: string, req: Request) {
  if (method === 'GET') {
    // Get recipes
    const { data, error } = await supabaseClient
      .from('recipes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } else if (method === 'POST') {
    // Add recipe
    const body = await req.json()
    const { data, error } = await supabaseClient
      .from('recipes')
      .insert({
        user_id: userId,
        title: body.title,
        details: body.details,
        calories: body.calories,
        time: body.time,
        tenant_id: body.tenant_id
      })
      .select()

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ data: data[0] }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleFavoriteRoutes(supabaseClient: any, userId: string, method: string, path: string, req: Request) {
  if (method === 'GET') {
    // Get favorites
    const { data, error } = await supabaseClient
      .from('favorites')
      .select(`
        *,
        recipes (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } else if (method === 'POST') {
    // Add favorite
    const body = await req.json()
    const { data, error } = await supabaseClient
      .from('favorites')
      .insert({
        user_id: userId,
        recipe_id: body.recipe_id,
        tenant_id: body.tenant_id
      })
      .select()

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ data: data[0] }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } else if (method === 'DELETE') {
    // Remove favorite
    const url = new URL(req.url)
    const recipeId = url.searchParams.get('recipe_id')
    
    if (!recipeId) {
      return new Response(
        JSON.stringify({ error: 'Recipe ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { error } = await supabaseClient
      .from('favorites')
      .delete()
      .eq('recipe_id', recipeId)
      .eq('user_id', userId)

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
