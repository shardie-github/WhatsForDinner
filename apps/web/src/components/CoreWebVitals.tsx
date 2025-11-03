'use client';

import { useEffect } from 'react';
import { onCLS, onFID, onFCP, onLCP, onTTFB, onINP, Metric } from 'web-vitals';
import { logger } from '@/lib/logger';

interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

function sendToAnalytics(metric: WebVitalsMetric) {
  // Send to your analytics service
  logger.info('Core Web Vital', {
    metric: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
  });

  // Also send to monitoring service if available
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
    });
  }
}

function getRating(value: number, thresholds: { good: number; poor: number }): 'good' | 'needs-improvement' | 'poor' {
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
}

export function CoreWebVitals() {
  useEffect(() => {
    // LCP - Largest Contentful Paint
    onLCP((metric: Metric) => {
      const rating = getRating(metric.value, { good: 2500, poor: 4000 });
      sendToAnalytics({
        name: 'LCP',
        value: metric.value,
        rating,
        delta: metric.delta,
        id: metric.id,
      });
    });

    // FID - First Input Delay
    onFID((metric: Metric) => {
      const rating = getRating(metric.value, { good: 100, poor: 300 });
      sendToAnalytics({
        name: 'FID',
        value: metric.value,
        rating,
        delta: metric.delta,
        id: metric.id,
      });
    });

    // CLS - Cumulative Layout Shift
    onCLS((metric: Metric) => {
      const rating = getRating(metric.value, { good: 0.1, poor: 0.25 });
      sendToAnalytics({
        name: 'CLS',
        value: metric.value,
        rating,
        delta: metric.delta,
        id: metric.id,
      });
    });

    // FCP - First Contentful Paint
    onFCP((metric: Metric) => {
      const rating = getRating(metric.value, { good: 1800, poor: 3000 });
      sendToAnalytics({
        name: 'FCP',
        value: metric.value,
        rating,
        delta: metric.delta,
        id: metric.id,
      });
    });

    // TTFB - Time to First Byte
    onTTFB((metric: Metric) => {
      const rating = getRating(metric.value, { good: 800, poor: 1800 });
      sendToAnalytics({
        name: 'TTFB',
        value: metric.value,
        rating,
        delta: metric.delta,
        id: metric.id,
      });
    });

    // INP - Interaction to Next Paint (experimental)
    if (onINP) {
      onINP((metric: Metric) => {
        const rating = getRating(metric.value, { good: 200, poor: 500 });
        sendToAnalytics({
          name: 'INP',
          value: metric.value,
          rating,
          delta: metric.delta,
          id: metric.id,
        });
      });
    }
  }, []);

  return null;
}
