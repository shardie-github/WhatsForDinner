import houseAds from '@nomad/config/house-ads';

export interface HouseAd {
  id: string;
  kind: 'banner' | 'tile';
  title: string;
  body: string;
  cta: string;
  target: string;
  image: string | null;
}

export interface HouseAdProps {
  ad: HouseAd;
  onPress?: (target: string) => void;
}

export function getHouseAd(id: string): HouseAd | null {
  return (houseAds as HouseAd[]).find((ad) => ad.id === id) || null;
}

export function getRandomHouseAd(kind?: 'banner' | 'tile'): HouseAd | null {
  let available = houseAds as HouseAd[];
  
  if (kind) {
    available = available.filter((ad) => ad.kind === kind);
  }

  if (available.length === 0) {
    return null;
  }

  return available[Math.floor(Math.random() * available.length)];
}

export class HouseAdRenderer {
  render(ad: HouseAd): { title: string; body: string; cta: string; target: string } {
    return {
      title: ad.title,
      body: ad.body,
      cta: ad.cta,
      target: ad.target,
    };
  }

  handlePress(target: string): void {
    if (target.startsWith('nomad://')) {
      // Deep link handling would be implemented here
          } else if (target.startsWith('http')) {
      window.open(target, '_blank');
    }
  }
}

export const houseAdRenderer = new HouseAdRenderer();
