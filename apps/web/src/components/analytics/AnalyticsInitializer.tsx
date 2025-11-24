/**
 * Analytics Initializer Component
 * 
 * Initializes analytics on client side
 */

'use client';

import { useEffect } from 'react';
import { initAnalytics } from '@/lib/analytics/config';

export function AnalyticsInitializer() {
  useEffect(() => {
    initAnalytics();
  }, []);

  return null;
}
