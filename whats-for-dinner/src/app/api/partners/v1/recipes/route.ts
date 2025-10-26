import { NextRequest, NextResponse } from 'next/server';
import { partnerAPIGateway } from '@/lib/partner-api/apiGateway';
import { z } from 'zod';

const RecipeQuerySchema = z.object({
  query: z.string().optional(),
  cuisine: z.string().optional(),
  dietary_restrictions: z.string().optional(),
  max_prep_time: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  limit: z.string().optional(),
  offset: z.string().optional(),
});

const RecipeCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  ingredients: z.array(z.object({
    name: z.string(),
    amount: z.string(),
    unit: z.string().optional(),
  })),
  instructions: z.array(z.string()),
  prep_time: z.number().optional(),
  cook_time: z.number().optional(),
  servings: z.number().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  cuisine: z.string().optional(),
  dietary_tags: z.array(z.string()).optional(),
  nutrition: z.object({
    calories: z.number().optional(),
    protein: z.number().optional(),
    carbs: z.number().optional(),
    fat: z.number().optional(),
  }).optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Authenticate request
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key required' },
        { status: 401 }
      );
    }

    const auth = await partnerAPIGateway.authenticateRequest(apiKey);
    if (!auth) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      query: searchParams.get('query'),
      cuisine: searchParams.get('cuisine'),
      dietary_restrictions: searchParams.get('dietary_restrictions'),
      max_prep_time: searchParams.get('max_prep_time'),
      difficulty: searchParams.get('difficulty') as 'easy' | 'medium' | 'hard' | null,
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    };

    const validatedParams = RecipeQuerySchema.parse(queryParams);

    // Build Supabase query
    const supabase = createClient();
    let query = supabase
      .from('recipes')
      .select(`
        id,
        name,
        description,
        ingredients,
        instructions,
        prep_time,
        cook_time,
        servings,
        difficulty,
        cuisine,
        dietary_tags,
        nutrition,
        created_at,
        updated_at
      `)
      .eq('is_public', true);

    // Apply filters
    if (validatedParams.query) {
      query = query.or(`name.ilike.%${validatedParams.query}%,description.ilike.%${validatedParams.query}%`);
    }
    if (validatedParams.cuisine) {
      query = query.eq('cuisine', validatedParams.cuisine);
    }
    if (validatedParams.dietary_restrictions) {
      const restrictions = validatedParams.dietary_restrictions.split(',');
      query = query.overlaps('dietary_tags', restrictions);
    }
    if (validatedParams.max_prep_time) {
      query = query.lte('prep_time', parseInt(validatedParams.max_prep_time));
    }
    if (validatedParams.difficulty) {
      query = query.eq('difficulty', validatedParams.difficulty);
    }

    // Apply pagination
    const limit = parseInt(validatedParams.limit || '20');
    const offset = parseInt(validatedParams.offset || '0');
    query = query.range(offset, offset + limit - 1);

    // Order by creation date
    query = query.order('created_at', { ascending: false });

    const { data: recipes, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch recipes' },
        { status: 500 }
      );
    }

    // Log API request
    const startTime = Date.now();
    await partnerAPIGateway.logRequest(
      auth.partner.id,
      auth.apiKey.id,
      '/api/partners/v1/recipes',
      'GET',
      200,
      Date.now() - startTime,
      request.headers.get('user-agent') || undefined,
      request.ip || undefined
    );

    return NextResponse.json({
      recipes: recipes || [],
      pagination: {
        limit,
        offset,
        has_more: (recipes?.length || 0) === limit,
      },
      meta: {
        total_count: recipes?.length || 0,
        partner_id: auth.partner.id,
        request_id: crypto.randomUUID(),
      }
    });

  } catch (error) {
    console.error('API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate request
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key required' },
        { status: 401 }
      );
    }

    const auth = await partnerAPIGateway.authenticateRequest(apiKey);
    if (!auth) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // Check permissions
    if (!auth.apiKey.permissions.includes('recipes:write')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = RecipeCreateSchema.parse(body);

    // Create recipe
    const supabase = createClient();
    const { data: recipe, error } = await supabase
      .from('recipes')
      .insert({
        ...validatedData,
        partner_id: auth.partner.id,
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create recipe' },
        { status: 500 }
      );
    }

    // Send webhook notification
    await partnerAPIGateway.sendWebhook(
      auth.partner.id,
      'recipe.created',
      { recipe }
    );

    // Log API request
    const startTime = Date.now();
    await partnerAPIGateway.logRequest(
      auth.partner.id,
      auth.apiKey.id,
      '/api/partners/v1/recipes',
      'POST',
      201,
      Date.now() - startTime,
      request.headers.get('user-agent') || undefined,
      request.ip || undefined
    );

    return NextResponse.json({
      recipe,
      meta: {
        partner_id: auth.partner.id,
        request_id: crypto.randomUUID(),
      }
    }, { status: 201 });

  } catch (error) {
    console.error('API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}