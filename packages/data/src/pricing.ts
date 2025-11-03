/**
 * Client-side Pricing Hooks & Types
 * usePrice() hook ? fetch current price; react to experiment assignment
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface PriceRecommendation {
  price_cents: number;
  confidence: number;
  reason: string;
  source: 'base' | 'elasticity' | 'vanwestendorp' | 'experiment' | 'geopricing';
}

export interface RevenueSummary {
  period: 'month' | 'quarter';
  start_date: string;
  end_date: string;
  snapshots: Array<{
    mrr_cents: number;
    arr_cents: number;
    arpu_cents: number;
    ltv_cents: number;
    cac_cents: number;
    churn_rate: number;
    conversion_rate: number;
  }>;
}

export interface ElasticityData {
  country: string | null;
  plan: string;
  elasticity: number;
  price_points: number[];
  demand: number[];
  updated_at: Date;
}

/**
 * Fetch current price recommendation
 */
async function fetchPrice(params: {
  plan: string;
  country?: string;
  platform?: string;
  currency?: string;
}): Promise<PriceRecommendation> {
  const searchParams = new URLSearchParams({
    plan: params.plan,
    ...(params.country && { country: params.country }),
    ...(params.platform && { platform: params.platform }),
    ...(params.currency && { currency: params.currency }),
  });

  const response = await fetch(`/api/pricing/current?${searchParams}`);
  if (!response.ok) {
    throw new Error('Failed to fetch price');
  }
  return response.json();
}

/**
 * Submit Van Westendorp survey
 */
async function submitSurvey(data: {
  too_cheap: number;
  cheap: number;
  expensive: number;
  too_expensive: number;
  country: string;
  currency?: string;
}): Promise<{ success: boolean; median_optimal_price: number }> {
  const response = await fetch('/api/pricing/survey', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to submit survey');
  }

  return response.json();
}

/**
 * Fetch revenue summary
 */
async function fetchRevenueSummary(period: 'month' | 'quarter' = 'month'): Promise<RevenueSummary> {
  const response = await fetch(`/api/revenue/summary?period=${period}`);
  if (!response.ok) {
    throw new Error('Failed to fetch revenue summary');
  }
  return response.json();
}

/**
 * Fetch elasticity data
 */
async function fetchElasticity(country: string, plan: string): Promise<ElasticityData> {
  const response = await fetch(`/api/elasticity/${country}/${plan}`);
  if (!response.ok) {
    throw new Error('Failed to fetch elasticity');
  }
  return response.json();
}

/**
 * Hook: usePrice
 * Fetches current price and reacts to experiment assignments
 */
export function usePrice(
  plan: string,
  options?: {
    country?: string;
    platform?: 'ios' | 'android' | 'web';
    currency?: string;
    enabled?: boolean;
  },
) {
  return useQuery({
    queryKey: ['price', plan, options?.country, options?.platform, options?.currency],
    queryFn: () =>
      fetchPrice({
        plan,
        country: options?.country,
        platform: options?.platform,
        currency: options?.currency,
      }),
    enabled: options?.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook: useRevenueSummary
 */
export function useRevenueSummary(period: 'month' | 'quarter' = 'month') {
  return useQuery({
    queryKey: ['revenue-summary', period],
    queryFn: () => fetchRevenueSummary(period),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Hook: useElasticity
 */
export function useElasticity(country: string, plan: string) {
  return useQuery({
    queryKey: ['elasticity', country, plan],
    queryFn: () => fetchElasticity(country, plan),
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

/**
 * Submit survey mutation
 */
export function useSubmitSurvey() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: submitSurvey,
    onSuccess: () => {
      // Invalidate price queries to refresh
      queryClient.invalidateQueries({ queryKey: ['price'] });
    },
  });
}
