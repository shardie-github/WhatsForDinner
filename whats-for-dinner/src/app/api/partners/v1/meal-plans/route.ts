import { NextRequest, NextResponse } from 'next/server';
import { partnerAPIGateway } from '@/lib/partner-api/apiGateway';
import { z } from 'zod';

const MealPlanQuerySchema = z.object({
  user_id: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  dietary_restrictions: z.string().optional(),
  preferences: z.string().optional(),
  limit: z.string().optional(),
  offset: z.string().optional(),
});

const MealPlanCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  start_date: z.string(),
  end_date: z.string(),
  meals: z.array(z.object({
    date: z.string(),
    meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
    recipe_id: z.string(),
    servings: z.number().optional(),
  })),
  dietary_restrictions: z.array(z.string()).optional(),
  preferences: z.record(z.any()).optional(),
  is_public: z.boolean().optional(),
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
      user_id: searchParams.get('user_id'),
      start_date: searchParams.get('start_date'),
      end_date: searchParams.get('end_date'),
      dietary_restrictions: searchParams.get('dietary_restrictions'),
      preferences: searchParams.get('preferences'),
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    };

    const validatedParams = MealPlanQuerySchema.parse(queryParams);

    // Build Supabase query
    const supabase = createClient();
    let query = supabase
      .from('meal_plans')
      .select(`
        id,
        name,
        description,
        start_date,
        end_date,
        meals,
        dietary_restrictions,
        preferences,
        is_public,
        created_at,
        updated_at,
        partner_id
      `);

    // Apply filters
    if (validatedParams.user_id) {
      query = query.eq('user_id', validatedParams.user_id);
    }
    if (validatedParams.start_date) {
      query = query.gte('start_date', validatedParams.start_date);
    }
    if (validatedParams.end_date) {
      query = query.lte('end_date', validatedParams.end_date);
    }
    if (validatedParams.dietary_restrictions) {
      const restrictions = validatedParams.dietary_restrictions.split(',');
      query = query.overlaps('dietary_restrictions', restrictions);
    }

    // Only show public meal plans or those created by the partner
    query = query.or(`is_public.eq.true,partner_id.eq.${auth.partner.id}`);

    // Apply pagination
    const limit = parseInt(validatedParams.limit || '20');
    const offset = parseInt(validatedParams.offset || '0');
    query = query.range(offset, offset + limit - 1);

    // Order by creation date
    query = query.order('created_at', { ascending: false });

    const { data: mealPlans, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch meal plans' },
        { status: 500 }
      );
    }

    // Log API request
    const startTime = Date.now();
    await partnerAPIGateway.logRequest(
      auth.partner.id,
      auth.apiKey.id,
      '/api/partners/v1/meal-plans',
      'GET',
      200,
      Date.now() - startTime,
      request.headers.get('user-agent') || undefined,
      request.ip || undefined
    );

    return NextResponse.json({
      meal_plans: mealPlans || [],
      pagination: {
        limit,
        offset,
        has_more: (mealPlans?.length || 0) === limit,
      },
      meta: {
        total_count: mealPlans?.length || 0,
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
    if (!auth.apiKey.permissions.includes('meal_plans:write')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = MealPlanCreateSchema.parse(body);

    // Validate date range
    const startDate = new Date(validatedData.start_date);
    const endDate = new Date(validatedData.end_date);
    
    if (startDate >= endDate) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    // Validate meal dates are within range
    for (const meal of validatedData.meals) {
      const mealDate = new Date(meal.date);
      if (mealDate < startDate || mealDate > endDate) {
        return NextResponse.json(
          { error: `Meal date ${meal.date} is outside the meal plan date range` },
          { status: 400 }
        );
      }
    }

    // Create meal plan
    const supabase = createClient();
    const { data: mealPlan, error } = await supabase
      .from('meal_plans')
      .insert({
        ...validatedData,
        partner_id: auth.partner.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create meal plan' },
        { status: 500 }
      );
    }

    // Send webhook notification
    await partnerAPIGateway.sendWebhook(
      auth.partner.id,
      'meal_plan.created',
      { meal_plan: mealPlan }
    );

    // Log API request
    const startTime = Date.now();
    await partnerAPIGateway.logRequest(
      auth.partner.id,
      auth.apiKey.id,
      '/api/partners/v1/meal-plans',
      'POST',
      201,
      Date.now() - startTime,
      request.headers.get('user-agent') || undefined,
      request.ip || undefined
    );

    return NextResponse.json({
      meal_plan: mealPlan,
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