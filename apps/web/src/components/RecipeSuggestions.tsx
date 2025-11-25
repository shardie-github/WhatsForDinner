'use client';

import { useState, useEffect } from 'react';
import { Recipe } from '@/lib/validation';
import RecipeCard from './RecipeCard';
import { LoadingSpinner } from './ui/loading-spinner';
import { Card, CardContent } from './ui/card';

interface RecipeSuggestionsProps {
  ingredients: string[];
}

export default function RecipeSuggestions({ ingredients }: RecipeSuggestionsProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/recipes/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ingredients,
            count: 3,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate recipes');
        }

        const data = await response.json();
        setRecipes(data.recipes || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load recipes');
      } finally {
        setLoading(false);
      }
    };

    if (ingredients.length > 0) {
      fetchRecipes();
    }
  }, [ingredients]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (recipes.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">No recipes found for these ingredients.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {recipes.map((recipe, index) => (
        <RecipeCard key={index} recipe={recipe} canSave={false} />
      ))}
    </div>
  );
}
