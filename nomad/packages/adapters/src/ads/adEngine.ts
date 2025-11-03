import type { FeatureFlags } from '@nomad/config';
import houseAds from '@nomad/config/house-ads';

export type AdSlot = 
  | 'dash_bottom'
  | 'dash_top'
  | 'planner_banner'
  | 'inspire_interstitial'
  | 'inspire_tile'
  | 'grocery_banner';

export type AdContext = {
  screen: string;
  slot: AdSlot;
  flags: FeatureFlags;
  consent: boolean;
  networkStatus: 'online' | 'offline';
  userPlan: 'free' | 'premium' | 'family';
  frequencyCap?: {
    slot: AdSlot;
    count: number;
    window: number; // seconds
  };
};

export type AdDecision = {
  type: 'admob' | 'gpt' | 'house' | 'none';
  placementProps?: {
    adUnitId?: string;
    slotId?: string;
    size?: string;
    houseAdId?: string;
  };
};

export class AdEngine {
  private frequencyCaps = new Map<string, { count: number; lastReset: number }>();
  private readonly FREQUENCY_CAP_WINDOW = 3600; // 1 hour

  decide(context: AdContext): AdDecision {
    // Premium users: no ads
    if (context.userPlan === 'premium' || context.userPlan === 'family') {
      return { type: 'none' };
    }

    // No consent: house ad only
    if (!context.consent) {
      return this.selectHouseAd(context);
    }

    // Offline: house ad only
    if (context.networkStatus === 'offline') {
      return this.selectHouseAd(context);
    }

    // Feature flag disabled
    if (!context.flags.ads) {
      return this.selectHouseAd(context);
    }

    // Frequency cap check
    if (this.isFrequencyCapped(context.slot)) {
      return this.selectHouseAd(context);
    }

    // Choose network based on platform
    const platform = this.detectPlatform();
    
    if (platform === 'native') {
      return {
        type: 'admob',
        placementProps: {
          adUnitId: this.getAdMobUnitId(context.slot),
        },
      };
    }

    return {
      type: 'gpt',
      placementProps: {
        slotId: this.getGPTSlotId(context.slot),
        size: this.getGPTSize(context.slot),
      },
    };
  }

  private selectHouseAd(context: AdContext): AdDecision {
    const available = houseAds.filter((ad) => {
      // Filter by slot compatibility
      if (context.slot === 'inspire_interstitial' && ad.kind !== 'banner') {
        return false;
      }
      return true;
    });

    if (available.length === 0) {
      return { type: 'none' };
    }

    // Random selection (could be weighted)
    const selected = available[Math.floor(Math.random() * available.length)];

    return {
      type: 'house',
      placementProps: {
        houseAdId: selected.id,
      },
    };
  }

  private isFrequencyCapped(slot: AdSlot): boolean {
    const key = slot;
    const cap = this.frequencyCaps.get(key);

    if (!cap) {
      return false;
    }

    const now = Date.now();
    const elapsed = (now - cap.lastReset) / 1000;

    if (elapsed > this.FREQUENCY_CAP_WINDOW) {
      this.frequencyCaps.delete(key);
      return false;
    }

    // Cap: max 3 ads per hour per slot
    return cap.count >= 3;
  }

  recordImpression(slot: AdSlot): void {
    const key = slot;
    const cap = this.frequencyCaps.get(key);

    if (!cap) {
      this.frequencyCaps.set(key, { count: 1, lastReset: Date.now() });
      return;
    }

    const now = Date.now();
    const elapsed = (now - cap.lastReset) / 1000;

    if (elapsed > this.FREQUENCY_CAP_WINDOW) {
      this.frequencyCaps.set(key, { count: 1, lastReset: now });
    } else {
      cap.count++;
    }
  }

  private detectPlatform(): 'web' | 'native' {
    if (typeof window === 'undefined') {
      return 'native';
    }
    return 'web';
  }

  private getAdMobUnitId(slot: AdSlot): string {
    // These would come from env vars
    const unitIds: Record<AdSlot, string> = {
      dash_bottom: process.env.ADMOB_BANNER_UNIT_ID || '',
      dash_top: process.env.ADMOB_BANNER_UNIT_ID || '',
      planner_banner: process.env.ADMOB_BANNER_UNIT_ID || '',
      inspire_interstitial: process.env.ADMOB_INTERSTITIAL_UNIT_ID || '',
      inspire_tile: process.env.ADMOB_NATIVE_UNIT_ID || '',
      grocery_banner: process.env.ADMOB_BANNER_UNIT_ID || '',
    };
    return unitIds[slot] || '';
  }

  private getGPTSlotId(slot: AdSlot): string {
    const slotIds: Record<AdSlot, string> = {
      dash_bottom: '/12345678/nomad_dash_bottom',
      dash_top: '/12345678/nomad_dash_top',
      planner_banner: '/12345678/nomad_planner_banner',
      inspire_interstitial: '/12345678/nomad_inspire_interstitial',
      inspire_tile: '/12345678/nomad_inspire_tile',
      grocery_banner: '/12345678/nomad_grocery_banner',
    };
    return slotIds[slot] || '';
  }

  private getGPTSize(slot: AdSlot): string {
    const sizes: Record<AdSlot, string> = {
      dash_bottom: '320x50',
      dash_top: '320x50',
      planner_banner: '728x90',
      inspire_interstitial: '320x480',
      inspire_tile: '300x250',
      grocery_banner: '320x50',
    };
    return sizes[slot] || '320x50';
  }
}

export const adEngine = new AdEngine();
