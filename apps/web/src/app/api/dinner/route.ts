import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { GenerateRecipesRequestSchema } from '@/lib/validation';
import { generateRecipesWithFallback } from '@/lib/openaiService';
import { aiOptimization } from '@/lib/aiOptimization';
import { StripeService } from '@/lib/stripe';
import { withRateLimit } from '@/lib/rate-limiting';
import { getTenantContext } from '@/lib/auth-middleware';
import { withCSRFProtection } from '@/lib/csrf-middleware';
import { analytics } from '@/lib/analytics';

async function handler(req: NextRequest) {
  try {
    // Authenticate and get tenant context (validates user access)
    const tenantResult = await getTenantContext(req);
    if (!tenantResult.success) {
      return tenantResult.response;
    }

    const { context, tenantId } = tenantResult;
    const { supabase } = context;

    // Validate request body
    const body = await req.json();
    const { ingredients, preferences } =
      GenerateRecipesRequestSchema.parse(body);

    // Get tenant plan
    const { data: tenant } = await supabase
      .from('tenants')
      .select('plan')
      .eq('id', tenantId)
      .single();

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Create prompt from ingredients and preferences
    const prompt = `Generate 3 diverse recipes using these ingredients: ${ingredients.join(', ')}. ${preferences ? `Preferences: ${preferences}` : ''}`;

    // Track meal suggestion generation start time
    const startTime = Date.now();

    // Use AI optimization service  
    const result = await aiOptimization.getOptimizedResponse(
      prompt,
      preferences || '',
      tenantId,
      tenant.plan,
      async (model: string) => {
        const recipes = await generateRecipesWithFallback({
          ingredients,
          preferences,
          maxRetries: 3,
          retryDelay: 1000,
        });

        const tokens = Math.ceil(prompt.length / 4); // Rough estimation
        const cost =
          model === 'gpt-4o'
            ? StripeService.calculateTokenCost(tokens, 'gpt-4o')
            : StripeService.calculateTokenCost(tokens, 'gpt-4o-mini');

        return {
          response: recipes,
          tokens,
          cost,
        };
      }
    );

    const responseData = {
      recipes: result.response?.recipes || [],
      metadata: {
        ...result.response?.metadata,
        model: result.model,
        tokensUsed: result.tokens,
        costUsd: result.cost,
        cached: result.cached,
      },
    };

    // Track meal suggestion generated event
    const generationTime = Date.now() - startTime;
    await analytics.trackEvent('MEAL_SUGGESTION_GENERATED', {
      suggestion_id: crypto.randomUUID(),
      method: 'ai_generate',
      pantry_items_used: ingredients.length,
      dietary_preferences_applied: preferences ? [preferences] : [],
      generation_time_ms: generationTime,
      ai_model: result.model,
      tokens_used: result.tokens,
      cost_usd: result.cost,
      user_id: tenantId,
    });

    return NextResponse.json(responseData);
  } catch (error) {
    // Error handled: Error generating recipes:

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate recipes' },
      { status: 500 }
    );
  }
}

// Apply rate limiting and CSRF protection
export const POST = withRateLimit(
  {
    requests: 20,
    window: 60,
  },
  (req: NextRequest) => withCSRFProtection(handler, req)
);
