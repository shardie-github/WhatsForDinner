/**
 * Recipe Customizer Component
 * AI-powered recipe customization
 * Premium feature with pay-per-use option
 */

'use client';

import { useState } from 'react';
import { Sparkles, Sliders, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { UpgradePrompt } from './UpgradePrompt';

interface RecipeCustomizerProps {
  recipeId: string;
  currentRecipe: {
    title: string;
    ingredients: string[];
    isVegetarian?: boolean;
    spiceLevel?: number;
    proteinLevel?: number;
  };
  userPlan?: 'free' | 'pro';
  userCredits?: number;
}

export function RecipeCustomizer({ 
  recipeId, 
  currentRecipe, 
  userPlan = 'free',
  userCredits = 0 
}: RecipeCustomizerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVegetarian, setIsVegetarian] = useState(currentRecipe.isVegetarian || false);
  const [spiceLevel, setSpiceLevel] = useState(currentRecipe.spiceLevel || 3);
  const [proteinLevel, setProteinLevel] = useState(currentRecipe.proteinLevel || 3);
  const [isKidFriendly, setIsKidFriendly] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);

  const canCustomize = userPlan === 'pro' || userCredits > 0;
  const cost = userPlan === 'pro' ? 0 : 1; // 1 credit for free users

  const handleCustomize = async () => {
    if (!canCustomize) {
      return;
    }

    setIsCustomizing(true);
    try {
      const response = await fetch('/api/recipes/customize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeId,
          customizations: {
            vegetarian: isVegetarian,
            spiceLevel,
            proteinLevel,
            kidFriendly: isKidFriendly,
          },
        }),
      });

      const { customizedRecipe } = await response.json();
      // Handle success (show new recipe, etc.)
    } finally {
      setIsCustomizing(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Sliders className="w-4 h-4" />
            Customize Recipe
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Customize Recipe
            </DialogTitle>
            <DialogDescription>
              Use AI to customize this recipe to your preferences
            </DialogDescription>
          </DialogHeader>

          {!canCustomize && (
            <UpgradePrompt
              trigger="feature_lock"
              featureName="Recipe Customization"
            />
          )}

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="vegetarian">Make it Vegetarian</Label>
                <Switch
                  id="vegetarian"
                  checked={isVegetarian}
                  onCheckedChange={setIsVegetarian}
                  disabled={!canCustomize}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Spice Level</Label>
                  <span className="text-sm text-muted-foreground">{spiceLevel}/5</span>
                </div>
                <Slider
                  value={[spiceLevel]}
                  onValueChange={([value]) => setSpiceLevel(value)}
                  min={1}
                  max={5}
                  step={1}
                  disabled={!canCustomize}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Protein Level</Label>
                  <span className="text-sm text-muted-foreground">{proteinLevel}/5</span>
                </div>
                <Slider
                  value={[proteinLevel]}
                  onValueChange={([value]) => setProteinLevel(value)}
                  min={1}
                  max={5}
                  step={1}
                  disabled={!canCustomize}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="kid-friendly">Make it Kid-Friendly</Label>
                <Switch
                  id="kid-friendly"
                  checked={isKidFriendly}
                  onCheckedChange={setIsKidFriendly}
                  disabled={!canCustomize}
                />
              </div>
            </div>

            {userPlan === 'free' && (
              <div className="bg-muted/50 rounded-lg p-3 text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="font-semibold">Cost: 1 credit</span>
                </div>
                <p className="text-muted-foreground">
                  You have {userCredits} credits remaining. 
                  <a href="/marketplace" className="text-primary ml-1">Buy more</a>
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleCustomize}
                disabled={!canCustomize || isCustomizing}
                className="flex-1"
              >
                {isCustomizing ? 'Customizing...' : 'Apply Customizations'}
              </Button>
              {userPlan === 'free' && (
                <Button variant="outline" asChild>
                  <a href="/pricing">Upgrade to Pro</a>
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
