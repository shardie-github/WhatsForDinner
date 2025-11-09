/**
 * Upgrade Prompt Component
 * Shows after user hits free limits or achieves success
 * Non-pushy, value-focused upgrade prompt
 */

'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Zap, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';

interface UpgradePromptProps {
  trigger: 'recipe_limit' | 'success' | 'feature_lock';
  currentPlan?: 'free' | 'pro' | 'family';
  limitReached?: number;
  featureName?: string;
}

export function UpgradePrompt({ 
  trigger, 
  currentPlan = 'free',
  limitReached,
  featureName 
}: UpgradePromptProps) {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if dismissed
    const dismissedKey = `upgrade_prompt_${trigger}_dismissed`;
    const dismissedTime = localStorage.getItem(dismissedKey);
    if (dismissedTime) {
      const oneDay = 24 * 60 * 60 * 1000;
      if (Date.now() - parseInt(dismissedTime) < oneDay) {
        setDismissed(true);
        return;
      }
    }

    // Show based on trigger
    if (trigger === 'recipe_limit' && limitReached && limitReached >= 5) {
      setShow(true);
    } else if (trigger === 'success') {
      // Show after successful recipe generation
      const recipeCount = parseInt(localStorage.getItem('recipe_count') || '0');
      if (recipeCount >= 3 && recipeCount % 3 === 0) {
        setShow(true);
      }
    } else if (trigger === 'feature_lock') {
      setShow(true);
    }
  }, [trigger, limitReached]);

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    const dismissedKey = `upgrade_prompt_${trigger}_dismissed`;
    localStorage.setItem(dismissedKey, Date.now().toString());
  };

  if (!show || dismissed || currentPlan !== 'free') return null;

  const getMessage = () => {
    switch (trigger) {
      case 'recipe_limit':
        return {
          title: 'Unlock Unlimited Recipes',
          description: `You've generated ${limitReached} recipes! Upgrade to Pro for unlimited access.`,
          cta: 'Upgrade to Pro'
        };
      case 'success':
        return {
          title: 'Loving the recipes?',
          description: 'Upgrade to Pro for unlimited recipes, advanced customization, and more.',
          cta: 'See Pro Features'
        };
      case 'feature_lock':
        return {
          title: `Unlock ${featureName}`,
          description: 'This feature is available in Pro. Upgrade to access advanced meal planning.',
          cta: 'Upgrade Now'
        };
    }
  };

  const message = getMessage();

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 animate-in slide-in-from-bottom-5">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">{message.title}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <CardDescription>{message.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button asChild className="flex-1">
            <Link href="/pricing">
              <Zap className="w-4 h-4 mr-2" />
              {message.cta}
            </Link>
          </Button>
          <Button variant="outline" onClick={handleDismiss} className="sm:w-auto">
            Maybe Later
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
