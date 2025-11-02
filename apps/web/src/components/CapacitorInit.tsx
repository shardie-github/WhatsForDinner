'use client';

import { useEffect } from 'react';
import { initializeCapacitor } from '@/lib/capacitor/init';

export function CapacitorInit() {
  useEffect(() => {
    // Initialize Capacitor on client side only
    initializeCapacitor().catch(console.error);
  }, []);

  return null; // This component doesn't render anything
}
