/**
 * Client-side Experiments Hook
 * Fetches experiment assignments, provides sticky caching, and tracks exposure
 */

import { useQuery, useMutation } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';

export interface ExperimentAssignment {
  experimentKey: string;
  variantKey: string;
  meta?: Record<string, unknown>;
}

interface ExperimentAssignmentsResponse {
  assignments: Record<string, ExperimentAssignment | null>;
}

// Sticky cache in localStorage
const STICKY_CACHE_KEY = 'nomad_experiments_cache';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

function getStickyCache(): Record<string, { assignment: ExperimentAssignment; expiresAt: number }> {
  if (typeof window === 'undefined') return {};
  try {
    const cached = localStorage.getItem(STICKY_CACHE_KEY);
    if (!cached) return {};
    const data = JSON.parse(cached);
    // Clean expired entries
    const now = Date.now();
    const valid: Record<string, { assignment: ExperimentAssignment; expiresAt: number }> = {};
    for (const [key, value] of Object.entries(data)) {
      if ((value as any).expiresAt > now) {
        valid[key] = value as any;
      }
    }
    if (Object.keys(valid).length !== Object.keys(data).length) {
      localStorage.setItem(STICKY_CACHE_KEY, JSON.stringify(valid));
    }
    return valid;
  } catch {
    return {};
  }
}

function setStickyCache(key: string, assignment: ExperimentAssignment): void {
  if (typeof window === 'undefined') return;
  try {
    const cached = getStickyCache();
    cached[key] = {
      assignment,
      expiresAt: Date.now() + CACHE_TTL,
    };
    localStorage.setItem(STICKY_CACHE_KEY, JSON.stringify(cached));
  } catch {
    // Ignore localStorage errors
  }
}

function getAnonId(): string {
  if (typeof window === 'undefined') return 'anon_unknown';
  try {
    let anonId = localStorage.getItem('nomad_anon_id');
    if (!anonId) {
      anonId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem('nomad_anon_id', anonId);
    }
    return anonId;
  } catch {
    return 'anon_unknown';
  }
}

/**
 * Fetch experiment assignments from server
 */
async function fetchAssignments(
  experimentKeys: string[],
  userId: string | null,
  anonId: string,
): Promise<Record<string, ExperimentAssignment | null>> {
  const queryParams = new URLSearchParams({
    keys: experimentKeys.join(','),
    ...(userId ? { user_id: userId } : {}),
    anon_id: anonId,
  });

  const response = await fetch(`/api/experiments/assignments?${queryParams}`);
  if (!response.ok) {
    throw new Error('Failed to fetch experiment assignments');
  }
  const data: ExperimentAssignmentsResponse = await response.json();
  return data.assignments;
}

/**
 * Track experiment exposure
 */
async function trackExposure(
  experimentKey: string,
  variantKey: string,
  userId: string | null,
  anonId: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  try {
    await fetch('/api/experiments/exposure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        experiment_key: experimentKey,
        variant_key: variantKey,
        user_id: userId,
        anon_id: anonId,
        metadata,
      }),
    });
  } catch (error) {
    console.warn('Failed to track experiment exposure:', error);
  }
}

/**
 * Hook to get experiment assignment
 */
export function useExperiment(
  experimentKey: string,
  options?: {
    userId?: string | null;
    autoTrack?: boolean;
    fallback?: string;
  },
): {
  variant: string | null;
  meta: Record<string, unknown>;
  isLoading: boolean;
  trackExposure: (metadata?: Record<string, unknown>) => Promise<void>;
} {
  const anonId = getAnonId();
  const userId = options?.userId ?? null;
  const autoTrack = options?.autoTrack ?? true;

  // Check sticky cache first
  const cached = getStickyCache()[experimentKey];
  const cachedVariant = cached?.assignment?.variantKey || null;
  const cachedMeta = cached?.assignment?.meta || {};

  const [hasTracked, setHasTracked] = useState(false);

  // Fetch assignments
  const { data, isLoading } = useQuery({
    queryKey: ['experiments', experimentKey, userId, anonId],
    queryFn: () => fetchAssignments([experimentKey], userId, anonId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: !cached, // Skip if cached
  });

  const assignment = data?.[experimentKey] || cached?.assignment || null;
  const variant = assignment?.variantKey || options?.fallback || null;
  const meta = assignment?.meta || cachedMeta || {};

  // Auto-track exposure
  useEffect(() => {
    if (autoTrack && variant && !hasTracked && !isLoading) {
      trackExposure(experimentKey, variant, userId, anonId).then(() => {
        setHasTracked(true);
      });
    }
  }, [experimentKey, variant, userId, anonId, autoTrack, hasTracked, isLoading]);

  // Update cache
  useEffect(() => {
    if (assignment) {
      setStickyCache(experimentKey, assignment);
    }
  }, [experimentKey, assignment]);

  const trackExposureManual = useCallback(
    async (metadata?: Record<string, unknown>) => {
      if (variant) {
        await trackExposure(experimentKey, variant, userId, anonId, metadata);
        setHasTracked(true);
      }
    },
    [experimentKey, variant, userId, anonId],
  );

  return {
    variant,
    meta,
    isLoading,
    trackExposure: trackExposureManual,
  };
}

/**
 * Hook to get multiple experiment assignments
 */
export function useExperiments(
  experimentKeys: string[],
  options?: {
    userId?: string | null;
    autoTrack?: boolean;
  },
): {
  assignments: Record<string, { variant: string | null; meta: Record<string, unknown> }>;
  isLoading: boolean;
  trackExposure: (experimentKey: string, metadata?: Record<string, unknown>) => Promise<void>;
} {
  const anonId = getAnonId();
  const userId = options?.userId ?? null;

  // Check cache for all keys
  const cached = getStickyCache();
  const cachedAssignments: Record<string, { variant: string | null; meta: Record<string, unknown> }> = {};
  const missingKeys: string[] = [];

  for (const key of experimentKeys) {
    if (cached[key]) {
      cachedAssignments[key] = {
        variant: cached[key].assignment.variantKey,
        meta: cached[key].assignment.meta || {},
      };
    } else {
      missingKeys.push(key);
    }
  }

  const { data, isLoading } = useQuery({
    queryKey: ['experiments', experimentKeys.join(','), userId, anonId],
    queryFn: () => fetchAssignments(missingKeys.length > 0 ? missingKeys : experimentKeys, userId, anonId),
    staleTime: 5 * 60 * 1000,
    enabled: missingKeys.length > 0,
  });

  const serverAssignments = data || {};
  const allAssignments: Record<string, { variant: string | null; meta: Record<string, unknown> }> = {
    ...cachedAssignments,
  };

  for (const [key, assignment] of Object.entries(serverAssignments)) {
    if (assignment) {
      allAssignments[key] = {
        variant: assignment.variantKey,
        meta: assignment.meta || {},
      };
      setStickyCache(key, assignment);
    }
  }

  const trackExposureManual = useCallback(
    async (experimentKey: string, metadata?: Record<string, unknown>) => {
      const assignment = allAssignments[experimentKey];
      if (assignment?.variant) {
        await trackExposure(experimentKey, assignment.variant, userId, anonId, metadata);
      }
    },
    [allAssignments, userId, anonId],
  );

  return {
    assignments: allAssignments,
    isLoading,
    trackExposure: trackExposureManual,
  };
}
