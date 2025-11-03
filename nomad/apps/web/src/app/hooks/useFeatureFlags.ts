'use client';

import { useState, useEffect } from 'react';
import { defaultFlags, type FeatureFlags } from '@nomad/config';

export function useFeatureFlags(): FeatureFlags {
  const [flags, setFlags] = useState<FeatureFlags>(defaultFlags);

  useEffect(() => {
    // Fetch from API or use defaults
    setFlags(defaultFlags);
  }, []);

  return flags;
}
