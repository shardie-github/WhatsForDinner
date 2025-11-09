/**
 * Social Proof Widget
 * Shows live activity and social proof
 */

'use client';

import { useEffect, useState } from 'react';
import { Users, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Activity {
  type: 'recipe_generated' | 'user_signed_up' | 'recipe_saved';
  message: string;
  timestamp: number;
}

export function SocialProofWidget() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    // Simulate live activity (in production, use WebSocket or polling)
    const generateActivity = () => {
      const activities: Activity[] = [
        { type: 'recipe_generated', message: 'Sarah just generated a recipe', timestamp: Date.now() - 30000 },
        { type: 'user_signed_up', message: 'Mike joined What\'s for Dinner', timestamp: Date.now() - 60000 },
        { type: 'recipe_saved', message: 'Jessica saved a new recipe', timestamp: Date.now() - 90000 },
      ];
      setActivities(activities);

      // Update every 30 seconds
      const interval = setInterval(() => {
        const newActivity: Activity = {
          type: 'recipe_generated',
          message: `${['Sarah', 'Mike', 'Jessica', 'Alex', 'Emma'][Math.floor(Math.random() * 5)]} just generated a recipe`,
          timestamp: Date.now(),
        };
        setActivities(prev => [newActivity, ...prev].slice(0, 3));
      }, 30000);

      return () => clearInterval(interval);
    };

    generateActivity();
  }, []);

  return (
    <Card className="border-2 border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Live Activity</span>
        </div>
        <div className="space-y-2">
          {activities.map((activity, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>{activity.message}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>12,847+ users</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>12,847 recipes today</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
