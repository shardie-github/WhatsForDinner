/**
 * Confetti Animation
 * Celebration animation for achievements
 */

'use client';

import { useEffect } from 'react';
import confetti from 'canvas-confetti';

export function triggerConfetti(options?: {
  particleCount?: number;
  spread?: number;
  origin?: { x: number; y: number };
}) {
  const defaults = {
    particleCount: 100,
    spread: 70,
    origin: { x: 0.5, y: 0.5 },
    ...options,
  };

  confetti({
    ...defaults,
    colors: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'],
  });
}

export function triggerStreakCelebration() {
  // Fireworks effect
  const duration = 3000;
  const end = Date.now() + duration;

  const interval = setInterval(() => {
    if (Date.now() > end) {
      clearInterval(interval);
      return;
    }

    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#F59E0B', '#EF4444'],
    });
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#10B981', '#3B82F6'],
    });
  }, 250);
}

export function triggerBadgeUnlock() {
  confetti({
    particleCount: 200,
    spread: 100,
    origin: { x: 0.5, y: 0.5 },
    colors: ['#8B5CF6', '#EC4899', '#F59E0B'],
    shapes: ['circle', 'star'],
  });
}
