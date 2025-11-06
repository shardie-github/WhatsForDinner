import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../route';
import * as openaiService from '@/lib/openaiService';
import * as aiOptimization from '@/lib/aiOptimization';
import * as authMiddleware from '@/lib/auth-middleware';
import * as stripeService from '@/lib/stripe';

// Mock dependencies
vi.mock('@/lib/openaiService');
vi.mock('@/lib/aiOptimization');
vi.mock('@/lib/auth-middleware');
vi.mock('@/lib/stripe');
vi.mock('@/lib/rate-limiting', () => ({
  withRateLimit: (config: any, handler: any) => handler,
}));
vi.mock('@/lib/csrf-middleware', () => ({
  withCSRFProtection: (handler: any, req: any) => handler(req),
}));

describe('/api/dinner POST', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate recipes successfully', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const mockTenant = { id: 'tenant-123', plan: 'free' };
    const mockRecipes = [
      {
        title: 'Pasta Carbonara',
        ingredients: ['pasta', 'eggs', 'bacon'],
        steps: ['Cook pasta', 'Fry bacon'],
      },
    ];

    vi.mocked(authMiddleware.getTenantContext).mockResolvedValue({
      success: true,
      context: {
        supabase: {
          from: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockTenant, error: null }),
              }),
            }),
          }),
        },
      } as any,
      tenantId: 'tenant-123',
    });

    vi.mocked(openaiService.generateRecipesWithFallback).mockResolvedValue({
      recipes: mockRecipes,
      metadata: {},
    });

    vi.mocked(aiOptimization.aiOptimization.getOptimizedResponse).mockResolvedValue({
      response: { recipes: mockRecipes, metadata: {} },
      model: 'gpt-4o-mini',
      tokens: 100,
      cost: 0.01,
      cached: false,
    });

    const req = new NextRequest('http://localhost/api/dinner', {
      method: 'POST',
      body: JSON.stringify({
        ingredients: ['pasta', 'eggs', 'bacon'],
        preferences: 'italian',
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.recipes).toBeDefined();
    expect(data.recipes.length).toBeGreaterThan(0);
    expect(data.metadata).toBeDefined();
  });

  it('should handle authentication failure', async () => {
    vi.mocked(authMiddleware.getTenantContext).mockResolvedValue({
      success: false,
      response: new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      }),
    });

    const req = new NextRequest('http://localhost/api/dinner', {
      method: 'POST',
      body: JSON.stringify({
        ingredients: ['pasta'],
        preferences: '',
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(401);
  });

  it('should handle invalid request body', async () => {
    vi.mocked(authMiddleware.getTenantContext).mockResolvedValue({
      success: true,
      context: { supabase: {} } as any,
      tenantId: 'tenant-123',
    });

    const req = new NextRequest('http://localhost/api/dinner', {
      method: 'POST',
      body: JSON.stringify({
        invalid: 'data',
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
  });

  it('should handle tenant not found', async () => {
    vi.mocked(authMiddleware.getTenantContext).mockResolvedValue({
      success: true,
      context: {
        supabase: {
          from: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
          }),
        },
      } as any,
      tenantId: 'tenant-123',
    });

    const req = new NextRequest('http://localhost/api/dinner', {
      method: 'POST',
      body: JSON.stringify({
        ingredients: ['pasta'],
        preferences: '',
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(404);
  });

  it('should handle API errors gracefully', async () => {
    vi.mocked(authMiddleware.getTenantContext).mockResolvedValue({
      success: true,
      context: {
        supabase: {
          from: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { plan: 'free' }, error: null }),
              }),
            }),
          }),
        },
      } as any,
      tenantId: 'tenant-123',
    });

    vi.mocked(aiOptimization.aiOptimization.getOptimizedResponse).mockRejectedValue(
      new Error('API Error')
    );

    const req = new NextRequest('http://localhost/api/dinner', {
      method: 'POST',
      body: JSON.stringify({
        ingredients: ['pasta'],
        preferences: '',
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  it('should calculate cost correctly', async () => {
    const mockTenant = { id: 'tenant-123', plan: 'free' };
    const mockRecipes = [{ title: 'Test Recipe', ingredients: ['test'] }];

    vi.mocked(authMiddleware.getTenantContext).mockResolvedValue({
      success: true,
      context: {
        supabase: {
          from: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockTenant, error: null }),
              }),
            }),
          }),
        },
      } as any,
      tenantId: 'tenant-123',
    });

    vi.mocked(aiOptimization.aiOptimization.getOptimizedResponse).mockResolvedValue({
      response: { recipes: mockRecipes, metadata: {} },
      model: 'gpt-4o',
      tokens: 1000,
      cost: 0.1,
      cached: false,
    });

    const req = new NextRequest('http://localhost/api/dinner', {
      method: 'POST',
      body: JSON.stringify({
        ingredients: ['pasta'],
        preferences: '',
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(data.metadata.costUsd).toBeDefined();
    expect(data.metadata.tokensUsed).toBe(1000);
    expect(data.metadata.model).toBe('gpt-4o');
  });
});
