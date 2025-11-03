// React Native AdMob adapter
// Note: This is a TypeScript interface. Actual implementation would use
// react-native-google-mobile-ads or similar package.

export interface AdMobConfig {
  androidAppId: string;
  iosAppId: string;
}

export interface BannerAdProps {
  adUnitId: string;
  size?: 'banner' | 'largeBanner' | 'mediumRectangle' | 'fullBanner' | 'leaderboard' | 'smartBanner';
  onAdLoaded?: () => void;
  onAdFailedToLoad?: (error: Error) => void;
  onAdOpened?: () => void;
  onAdClosed?: () => void;
}

export interface InterstitialAd {
  adUnitId: string;
  load: () => Promise<void>;
  show: () => Promise<void>;
  isLoaded: () => boolean;
  addAdEventListener: (event: string, handler: () => void) => void;
}

export interface RewardedAd {
  adUnitId: string;
  load: () => Promise<void>;
  show: () => Promise<void>;
  isLoaded: () => boolean;
  addAdEventListener: (event: string, handler: (reward: { type: string; amount: number }) => void) => void;
}

export class AdMobManager {
  private config: AdMobConfig | null = null;
  private interstitials = new Map<string, InterstitialAd>();
  private rewardedAds = new Map<string, RewardedAd>();

  initialize(config: AdMobConfig): void {
    this.config = config;
    // Actual initialization would call MobileAds().initialize()
  }

  createBanner(props: BannerAdProps): BannerAdProps {
    return props;
  }

  preloadInterstitial(adUnitId: string): InterstitialAd {
    if (this.interstitials.has(adUnitId)) {
      return this.interstitials.get(adUnitId)!;
    }

    const interstitial: InterstitialAd = {
      adUnitId,
      isLoaded: () => false,
      load: async () => {
        // Actual implementation would call InterstitialAd.load()
      },
      show: async () => {
        // Actual implementation would call interstitial.show()
      },
      addAdEventListener: () => {},
    };

    this.interstitials.set(adUnitId, interstitial);
    return interstitial;
  }

  preloadRewarded(adUnitId: string): RewardedAd {
    if (this.rewardedAds.has(adUnitId)) {
      return this.rewardedAds.get(adUnitId)!;
    }

    const rewarded: RewardedAd = {
      adUnitId,
      isLoaded: () => false,
      load: async () => {
        // Actual implementation would call RewardedAd.load()
      },
      show: async () => {
        // Actual implementation would call rewarded.show()
      },
      addAdEventListener: () => {},
    };

    this.rewardedAds.set(adUnitId, rewarded);
    return rewarded;
  }

  getInterstitial(adUnitId: string): InterstitialAd | null {
    return this.interstitials.get(adUnitId) || null;
  }

  getRewarded(adUnitId: string): RewardedAd | null {
    return this.rewardedAds.get(adUnitId) || null;
  }
}

export const admobManager = new AdMobManager();
