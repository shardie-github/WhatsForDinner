/**
 * Partner Marketplace Ad Source
 * 
 * Fetches eligible partner creatives based on context, targeting, and pacing
 */

import type { AdContext, AdDecision } from './adEngine.js';
import { createComponentLogger } from '@whats-for-dinner/utils';

const logger = createComponentLogger('partnersource-ts');
export interface PartnerCreative {
  id: string;
  campaign_id: string;
  partner_id: string;
  kind: 'tile' | 'banner' | 'video' | 'native';
  assets: {
    image_url?: string;
    video_url?: string;
    title?: string;
    description?: string;
  };
  click_url: string;
  width?: number;
  height?: number;
  cpm_cents?: number;
  cpc_cents?: number;
  cpa_cents?: number;
}

export interface PartnerAdDecision extends AdDecision {
  type: 'partner';
  placementProps?: {
    creative: PartnerCreative;
    clickUrl: string; // Shortened /r/ link
    impressionUrl?: string;
  };
}

/**
 * Fetch eligible partner creatives for a context
 */
export async function fetchPartnerCreatives(
  context: AdContext,
  fetchFn: typeof fetch = fetch,
): Promise<PartnerCreative[]> {
  try {
    // Call internal API to get eligible creatives
    const params = new URLSearchParams({
      slot: context.slot,
      screen: context.screen,
      consent: String(context.consent),
      user_plan: context.userPlan,
      is_minor: String(context.isMinor || false),
    });

    // Add targeting filters if available
    if (context.flags?.tags) {
      params.append('tags', JSON.stringify(context.flags.tags));
    }

    const response = await fetchFn(`/api/ads/partner/eligible?${params.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.creatives || [];
  } catch (error) {
    logger.error('Failed to fetch partner creatives', { error });
    return [];
  }
}

/**
 * Select best partner creative based on bidding and targeting
 */
export function selectPartnerCreative(
  creatives: PartnerCreative[],
  context: AdContext,
): PartnerCreative | null {
  if (creatives.length === 0) {
    return null;
  }

  // Filter by slot compatibility
  const slotCompatible = creatives.filter((creative) => {
    // Match creative kind to slot
    if (context.slot === 'inspire_tile' && creative.kind !== 'tile') {
      return false;
    }
    if (context.slot.includes('banner') && creative.kind !== 'banner') {
      return false;
    }
    return true;
  });

  if (slotCompatible.length === 0) {
    return null;
  }

  // Select by highest bid (CPM > CPC > CPA)
  slotCompatible.sort((a, b) => {
    const bidA = a.cpm_cents || a.cpc_cents || a.cpa_cents || 0;
    const bidB = b.cpm_cents || b.cpc_cents || b.cpa_cents || 0;
    return bidB - bidA;
  });

  return slotCompatible[0];
}

/**
 * Decide if partner marketplace should be used
 */
export function shouldUsePartnerMarketplace(context: AdContext): boolean {
  // Check feature flag
  if (!context.flags?.ads) {
    return false;
  }

  // Check consent
  if (!context.consent) {
    return false;
  }

  // Check if minor (partner ads must be contextual/non-personalized)
  // For now, allow if consent is true (but partner should handle COPPA)
  if (context.isMinor && !context.consent) {
    return false;
  }

  // Check premium status (premium users don't see ads)
  if (context.userPlan === 'premium' || context.userPlan === 'family') {
    return false;
  }

  return true;
}
