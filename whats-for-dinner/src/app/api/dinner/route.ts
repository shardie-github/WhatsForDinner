import { NextResponse } from 'next/server';
import { z } from 'zod';
import { GenerateRecipesRequestSchema } from '@/lib/validation';
import { generateRecipesWithFallback } from '@/lib/openaiService';
import { aiOptimization } from '@/lib/aiOptimization';
import { supabase } from '@/lib/supabaseClient';
import { StripeService } from '@/lib/stripe';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  try {
    // Validate request body
    const body = await req.json();
    const { ingredients, preferences } =
      GenerateRecipesRequestSchema.parse(body);

    // Get tenant information from headers or user context
    const headersList = headers();
    const tenantId = headersList.get('x-tenant-id');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant information required' },
        { status: 400 }
      );
    }

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

    // Use AI optimization service
    const result = await aiOptimization.getOptimizedResponse(
      prompt,
      preferences || '',
      tenantId,
      tenant.plan,
      async (model: string) => {
        const startTime = Date.now();

        const recipes = await generateRecipesWithFallback({
          ingredients,
          preferences,
          maxRetries: 3,
          retryDelay: 1000,
          model: model as 'gpt-4o' | 'gpt-4o-mini',
        });

        const endTime = Date.now();
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

    return NextResponse.json({
      recipes: result.response.recipes,
      metadata: {
        ...result.response.metadata,
        model: result.model,
        tokensUsed: result.tokens,
        costUsd: result.cost,
        cached: result.cached,
      },
    });
  } catch (error) {
    console.error('Error generating recipes:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate recipes' },
      { status: 500 }
    );
  }
}
