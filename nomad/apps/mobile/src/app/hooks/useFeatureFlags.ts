import { useState, useEffect } from 'react';
import { defaultFlags, type FeatureFlags } from '@nomad/config';

export function useFeatureFlags(): FeatureFlags {
  const [flags, setFlags] = useState<FeatureFlags>(defaultFlags);

  useEffect(() => {
    // In production, fetch from remote config
    // For now, use defaults
    setFlags(defaultFlags);
  }, []);

  return flags;
}
