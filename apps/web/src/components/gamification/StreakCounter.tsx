/**
 * Streak Counter Component
 * Shows user's meal planning streak
 */

'use client';

import { useEffect, useState } from 'react';
import { Flame, Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { gamificationSystem, type Streak } from '@/lib/gamification/system';

interface StreakCounterProps {
  userId: string;
}

export function StreakCounter({ userId }: StreakCounterProps) {
  const [streak, setStreak] = useState<Streak | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStreak = async () => {
      const userStreak = await gamificationSystem.getUserStreak(userId);
      setStreak(userStreak);
      setIsLoading(false);
    };

    if (userId) {
      loadStreak();
    }
  }, [userId]);

  if (isLoading || !streak) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse">Loading streak...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Flame className="w-8 h-8 text-orange-500 animate-pulse" />
              {streak.current > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{streak.current}</span>
                </div>
              )}
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Current Streak</div>
              <div className="text-2xl font-bold">{streak.current} days</div>
            </div>
          </div>
          {streak.longest > streak.current && (
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Trophy className="w-4 h-4" />
                Best: {streak.longest} days
              </div>
            </div>
          )}
        </div>
        {streak.current >= 7 && (
          <Badge className="mt-2 bg-orange-500">
            🔥 {streak.current}-Day Streak! Keep it up!
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
