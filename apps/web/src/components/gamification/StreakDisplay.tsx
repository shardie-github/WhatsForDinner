/**
 * Streak Display Component
 * Shows current streak with celebration
 */

'use client';

import { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { StreakData } from '@/lib/gamification/streaks';

interface StreakDisplayProps {
  userId: string;
}

export function StreakDisplay({ userId }: StreakDisplayProps) {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    fetch(`/api/gamification/streak?userId=${userId}`)
      .then(res => res.json())
      .then(setStreak);
  }, [userId]);

  useEffect(() => {
    if (streak && streak.currentStreak > 0 && streak.currentStreak % 7 === 0) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  }, [streak]);

  if (!streak || streak.currentStreak === 0) return null;

  return (
    <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Flame className="w-8 h-8 text-orange-500 animate-pulse" />
            {showCelebration && (
              <div className="absolute inset-0 animate-ping">
                <Flame className="w-8 h-8 text-orange-500" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold">{streak.currentStreak}</div>
            <div className="text-sm text-muted-foreground">
              Day {streak.currentStreak === 1 ? 'Streak' : 'Streak'} 🔥
            </div>
          </div>
          {streak.currentStreak >= 7 && (
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              {streak.streakBonus.toFixed(1)}x Bonus
            </Badge>
          )}
        </div>
        {streak.longestStreak > streak.currentStreak && (
          <div className="mt-2 text-xs text-muted-foreground">
            Best: {streak.longestStreak} days
          </div>
        )}
      </CardContent>
    </Card>
  );
}
