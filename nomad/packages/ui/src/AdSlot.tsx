import React, { useEffect, useState } from 'react';
import { adEngine, type AdDecision, type AdSlot as AdSlotType } from '@nomad/adapters';
import type { FeatureFlags } from '@nomad/config';
import { houseAdRenderer, getHouseAd } from '@nomad/adapters';

export interface AdSlotProps {
  slot: AdSlotType;
  flags: FeatureFlags;
  consent: boolean;
  userPlan: 'free' | 'premium' | 'family';
  networkStatus?: 'online' | 'offline';
  className?: string;
  style?: React.CSSProperties;
}

export function AdSlot({
  slot,
  flags,
  consent,
  userPlan,
  networkStatus = 'online',
  className,
  style,
}: AdSlotProps) {
  const [decision, setDecision] = useState<AdDecision | null>(null);
  const [houseAd, setHouseAd] = useState<ReturnType<typeof houseAdRenderer.render> | null>(null);

  useEffect(() => {
    const adDecision = adEngine.decide({
      screen: 'unknown',
      slot,
      flags,
      consent,
      networkStatus,
      userPlan,
    });

    setDecision(adDecision);

    if (adDecision.type === 'house' && adDecision.placementProps?.houseAdId) {
      const ad = getHouseAd(adDecision.placementProps.houseAdId);
      if (ad) {
        setHouseAd(houseAdRenderer.render(ad));
      }
    }

    if (adDecision.type !== 'none') {
      adEngine.recordImpression(slot);
    }
  }, [slot, flags, consent, userPlan, networkStatus]);

  if (!decision || decision.type === 'none') {
    return null;
  }

  // House ad rendering
  if (decision.type === 'house' && houseAd) {
    return (
      <div
        className={className}
        style={{
          padding: '12px',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          backgroundColor: '#f9fafb',
          ...style,
        }}
        data-testid={`ad-slot-${slot}`}
      >
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>
          {houseAd.title}
        </h3>
        <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#6b7280' }}>
          {houseAd.body}
        </p>
        <button
          onClick={() => houseAdRenderer.handlePress(houseAd.target)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          {houseAd.cta}
        </button>
      </div>
    );
  }

  // Network ad placeholder (would be replaced with actual AdMob/GPT components)
  if (decision.type === 'admob' || decision.type === 'gpt') {
    return (
      <div
        className={className}
        style={{
          minHeight: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f3f4f6',
          ...style,
        }}
        data-testid={`ad-slot-${slot}`}
        data-ad-type={decision.type}
        data-ad-unit-id={decision.placementProps?.adUnitId}
        data-slot-id={decision.placementProps?.slotId}
      >
        <span style={{ fontSize: '12px', color: '#9ca3af' }}>
          Ad ({decision.type})
        </span>
      </div>
    );
  }

  return null;
}
