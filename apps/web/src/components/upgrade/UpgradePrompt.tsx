'use client';

import { useState } from 'react';
import { Crown, Zap, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface UpgradePromptProps {
  trigger: 'limit' | 'feature' | 'power-user';
  currentPlan?: 'free' | 'pro' | 'premium';
  onUpgrade: () => void;
  onDismiss?: () => void;
}

export default function UpgradePrompt({
  trigger,
  currentPlan = 'free',
  onUpgrade,
  onDismiss,
}: UpgradePromptProps) {
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  if (dismissed) {
    return null;
  }

  const getTriggerContent = () => {
    switch (trigger) {
      case 'limit':
        return {
          title: 'Upgrade to Pro for Unlimited Recipes',
          description: 'You\'ve reached your daily limit. Upgrade to Pro for unlimited recipe generation.',
          features: ['Unlimited recipes', 'Advanced meal planning', 'Priority support'],
        };
      case 'feature':
        return {
          title: 'This Feature Requires Premium',
          description: 'Upgrade to Premium to access this feature and more.',
          features: ['All Pro features', 'Meal planning', 'Grocery integration', 'Family sharing'],
        };
      case 'power-user':
        return {
          title: 'You\'re a Power User!',
          description: 'You generate 5+ recipes per week. Upgrade to Pro for more features.',
          features: ['Unlimited recipes', 'Advanced meal planning', 'Priority support'],
        };
      default:
        return {
          title: 'Upgrade to Pro',
          description: 'Get more features and unlimited recipes.',
          features: ['Unlimited recipes', 'Advanced meal planning', 'Priority support'],
        };
    }
  };

  const content = getTriggerContent();

  return (
    <Card className="border-primary/50 bg-primary/5">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            <CardTitle>{content.title}</CardTitle>
          </div>
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0"
              aria-label="Dismiss upgrade prompt"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <CardDescription>{content.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {content.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-primary" />
              {feature}
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <Button onClick={onUpgrade} className="flex-1">
            Upgrade to Pro
          </Button>
          {onDismiss && (
            <Button variant="outline" onClick={handleDismiss}>
              Maybe Later
            </Button>
          )}
        </div>
        <div className="text-xs text-muted-foreground text-center">
          Starting at $9.99/month • Cancel anytime
        </div>
      </CardContent>
    </Card>
  );
}
