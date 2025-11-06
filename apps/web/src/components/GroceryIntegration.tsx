'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, ExternalLink, Sparkles, Check } from 'lucide-react';
import { analytics } from '@/lib/analytics';

interface GroceryIntegrationProps {
  recipeId?: string;
  recipeTitle?: string;
  ingredients?: string[];
}

export default function GroceryIntegration({
  recipeId,
  recipeTitle,
  ingredients = [],
}: GroceryIntegrationProps) {
  const [loading, setLoading] = useState(false);

  // In production, this would integrate with Instacart, Amazon Fresh, etc.
  const handleAddToCart = async (provider: 'instacart' | 'amazon' | 'walmart') => {
    setLoading(true);

    try {
      // Track event
      await analytics.trackEvent('grocery_integration_clicked', {
        provider,
        recipe_id: recipeId,
        recipe_title: recipeTitle,
        ingredients_count: ingredients.length,
      });

      // In production, this would:
      // 1. Format ingredients for the provider's API
      // 2. Create a cart with the provider
      // 3. Redirect to checkout or return cart URL

      // For now, show placeholder
      const providerUrls: Record<string, string> = {
        instacart: `https://www.instacart.com/search?q=${encodeURIComponent(ingredients.join(', '))}`,
        amazon: `https://www.amazon.com/s?k=${encodeURIComponent(ingredients.join('+'))}`,
        walmart: `https://www.walmart.com/search?q=${encodeURIComponent(ingredients.join('+'))}`,
      };

      window.open(providerUrls[provider], '_blank');

      // Track conversion
      await analytics.trackEvent('grocery_cart_created', {
        provider,
        recipe_id: recipeId,
      });
    } catch (error) {
      // Error handled: Error adding to cart:
    } finally {
      setLoading(false);
    }
  };

  if (ingredients.length === 0) {
    return null;
  }

  return (
    <Card className="border-2 bg-gradient-to-br from-green-50 to-background dark:from-green-950/20">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <ShoppingCart className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <CardTitle>Add to Grocery Cart</CardTitle>
            <CardDescription>
              Get ingredients delivered with one click
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ingredients List */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Ingredients needed:</p>
          <div className="flex flex-wrap gap-2">
            {ingredients.slice(0, 5).map((ingredient, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {ingredient}
              </Badge>
            ))}
            {ingredients.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{ingredients.length - 5} more
              </Badge>
            )}
          </div>
        </div>

        {/* Provider Buttons */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Choose delivery service:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => handleAddToCart('instacart')}
              disabled={loading}
            >
              <ShoppingCart className="h-4 w-4" />
              Instacart
              <ExternalLink className="h-3 w-3 ml-auto" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => handleAddToCart('amazon')}
              disabled={loading}
            >
              <ShoppingCart className="h-4 w-4" />
              Amazon Fresh
              <ExternalLink className="h-3 w-3 ml-auto" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => handleAddToCart('walmart')}
              disabled={loading}
            >
              <ShoppingCart className="h-4 w-4" />
              Walmart+
              <ExternalLink className="h-3 w-3 ml-auto" />
            </Button>
          </div>
        </div>

        {/* Benefits */}
        <div className="pt-4 border-t space-y-2">
          <div className="flex items-start gap-2 text-sm">
            <Check className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            <span className="text-muted-foreground">
              Same-day delivery available
            </span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <Check className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            <span className="text-muted-foreground">
              Ingredients pre-selected for this recipe
            </span>
          </div>
        </div>

        {/* Coming Soon Badge */}
        <div className="pt-2">
          <Badge variant="outline" className="text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            Full integration coming soon
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
