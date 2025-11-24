/**
 * Example API Route with Validation and Rate Limiting
 * 
 * This demonstrates how to use the new validation and rate limiting utilities
 */

import { withRateLimit, apiRateLimiter } from '@/lib/rate-limit';
import { validateRequest, createRecipeSchema } from '@/lib/validation';
import { withPerformanceMonitoring } from '@/lib/performance-monitor';
import { cache, cacheKeys, cacheTags } from '@/lib/cache';

// Example: Create recipe endpoint with all new features
export const POST = withRateLimit(
  async (request: Request) => {
    return withPerformanceMonitoring(
      async (req: Request) => {
        // Validate request body
        const validation = await validateRequest(req, createRecipeSchema);
        if (validation.error) {
          return validation.error;
        }

        const recipeData = validation.data;

        // Check cache first
        const cacheKey = cacheKeys.recipe(`temp-${Date.now()}`);
        const cached = await cache.get(cacheKey);
        if (cached) {
          return Response.json(cached, {
            headers: { 'X-Cache': 'HIT' },
          });
        }

        // Process recipe creation (simulated)
        const recipe = {
          id: `recipe-${Date.now()}`,
          ...recipeData,
          createdAt: new Date().toISOString(),
        };

        // Cache the result
        await cache.set(cacheKey, recipe, {
          ttl: 3600, // 1 hour
          tags: [cacheTags.recipes],
        });

        return Response.json(
          { success: true, data: recipe },
          {
            headers: { 'X-Cache': 'MISS' },
          }
        );
      },
      '/api/example-validated'
    )(request);
  },
  apiRateLimiter
);

// Example: Get recipe endpoint with caching
export const GET = withRateLimit(
  async (request: Request) => {
    return withPerformanceMonitoring(
      async (req: Request) => {
        const url = new URL(req.url);
        const recipeId = url.searchParams.get('id');

        if (!recipeId) {
          return Response.json(
            { error: 'Recipe ID is required' },
            { status: 400 }
          );
        }

        // Check cache
        const cacheKey = cacheKeys.recipe(recipeId);
        const cached = await cache.get(cacheKey);
        if (cached) {
          return Response.json(cached, {
            headers: { 'X-Cache': 'HIT' },
          });
        }

        // Fetch from database (simulated)
        const recipe = {
          id: recipeId,
          title: 'Sample Recipe',
          ingredients: ['ingredient1', 'ingredient2'],
          steps: ['step1', 'step2'],
        };

        // Cache the result
        await cache.set(cacheKey, recipe, {
          ttl: 3600,
          tags: [cacheTags.recipes],
        });

        return Response.json(recipe, {
          headers: { 'X-Cache': 'MISS' },
        });
      },
      '/api/example-validated'
    )(request);
  },
  apiRateLimiter
);
