/**
 * Challenges Component
 * Shows active challenges and progress
 */

'use client';

import { useEffect, useState } from 'react';
import { Target, Zap, Gift } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { gamificationSystem, type Challenge } from '@/lib/gamification/system';

interface ChallengesProps {
  userId: string;
}

export function Challenges({ userId }: ChallengesProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadChallenges = async () => {
      const activeChallenges = await gamificationSystem.getActiveChallenges(userId);
      setChallenges(activeChallenges);
      setIsLoading(false);
    };

    if (userId) {
      loadChallenges();
    }
  }, [userId]);

  if (isLoading) {
    return <div className="animate-pulse">Loading challenges...</div>;
  }

  if (challenges.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No active challenges. Check back soon for new challenges!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {challenges.map((challenge) => {
        const progress = (challenge.progress / challenge.target) * 100;
        const isCompleted = challenge.progress >= challenge.target;

        return (
          <Card key={challenge.id} className={isCompleted ? 'border-2 border-green-500' : ''}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    {challenge.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{challenge.description}</p>
                </div>
                <Badge variant={challenge.type === 'special' ? 'default' : 'secondary'}>
                  {challenge.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span className="font-semibold">
                      {challenge.progress} / {challenge.target}
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Gift className="w-4 h-4 text-primary" />
                  <span>
                    Reward:{' '}
                    {challenge.reward.type === 'badge' && `Badge: ${challenge.reward.value}`}
                    {challenge.reward.type === 'credits' && `${challenge.reward.value} credits`}
                    {challenge.reward.type === 'feature' && `Pro feature: ${challenge.reward.value}`}
                  </span>
                </div>
                {challenge.expiresAt && (
                  <div className="text-xs text-muted-foreground">
                    Expires: {new Date(challenge.expiresAt).toLocaleDateString()}
                  </div>
                )}
                {isCompleted && (
                  <Badge className="bg-green-500">
                    <Zap className="w-3 h-3 mr-1" />
                    Completed!
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
