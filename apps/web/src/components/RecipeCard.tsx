'use client';

import { useState } from 'react';
import { Clock, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { Recipe } from '@/lib/validation';
import RecipeFeedback from './RecipeFeedback';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

interface RecipeCardProps {
  recipe: Recipe;
  onSave?: () => void;
  onRemove?: () => void;
  canSave?: boolean;
  isFavorite?: boolean;
  userId?: string;
  recipeId?: number;
}

export default function RecipeCard({
  recipe,
  onSave,
  onRemove,
  canSave = false,
  isFavorite = false,
  userId,
  recipeId,
}: RecipeCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Card className="group animate-fade-in transition-all duration-300 hover:shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold text-card-foreground transition-colors group-hover:text-primary">
          {recipe.title}
        </CardTitle>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{recipe.cookTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="h-4 w-4" />
            <span>{recipe.calories} cal</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <h4 className="mb-3 font-medium text-card-foreground">
            Ingredients:
          </h4>
          <div className="flex flex-wrap gap-2">
            {recipe.ingredients.map((ingredient, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {ingredient}
              </Badge>
            ))}
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
          className="h-auto w-full justify-between p-0 font-normal"
        >
          <span>{showDetails ? 'Hide' : 'Show'} Instructions</span>
          {showDetails ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronUp className="h-4 w-4" />
          )}
        </Button>

        {showDetails && (
          <div className="space-y-3">
            <Separator />
            <div>
              <h4 className="mb-3 font-medium text-card-foreground">
                Instructions:
              </h4>
              <ol className="space-y-3">
                {recipe.steps.map((step, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                      {index + 1}
                    </span>
                    <span className="text-sm leading-relaxed text-muted-foreground">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {canSave && !isFavorite && (
            <Button onClick={onSave} className="flex-1" size="sm">
              Save Recipe
            </Button>
          )}
          {isFavorite && onRemove && (
            <Button
              onClick={onRemove}
              variant="destructive"
              className="flex-1"
              size="sm"
            >
              Remove
            </Button>
          )}
        </div>

        {/* Recipe Feedback Component */}
        {userId && recipeId && (
          <div className="pt-4">
            <Separator className="mb-4" />
            <RecipeFeedback
              recipeId={recipeId}
              userId={userId}
              onFeedbackSubmitted={feedback => {
                console.log('Feedback submitted:', feedback);
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
