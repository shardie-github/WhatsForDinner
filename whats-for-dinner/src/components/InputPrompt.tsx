'use client';

import { useState } from 'react';
import { Plus, X, ChefHat } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

interface InputPromptProps {
  onGenerate: (ingredients: string[], preferences: string) => void;
  loading: boolean;
  pantryItems: string[];
}

export default function InputPrompt({
  onGenerate,
  loading,
  pantryItems,
}: InputPromptProps) {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [preferences, setPreferences] = useState('');
  const [newIngredient, setNewIngredient] = useState('');

  const addIngredient = () => {
    if (newIngredient.trim() && !ingredients.includes(newIngredient.trim())) {
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient('');
    }
  };

  const removeIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter(i => i !== ingredient));
  };

  const addFromPantry = (ingredient: string) => {
    if (!ingredients.includes(ingredient)) {
      setIngredients([...ingredients, ingredient]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ingredients.length > 0) {
      onGenerate(ingredients, preferences);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addIngredient();
    }
  };

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <ChefHat className="h-6 w-6 text-primary" />
          What ingredients do you have?
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="ingredient-input" className="text-base font-medium">
              Add ingredients
            </Label>
            <div className="flex gap-2">
              <Input
                id="ingredient-input"
                type="text"
                value={newIngredient}
                placeholder="Type an ingredient and press Enter..."
                className="flex-1"
                disabled={loading}
                onChange={e => setNewIngredient(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button
                type="button"
                disabled={!newIngredient.trim() || loading}
                size="icon"
                variant="outline"
                onClick={addIngredient}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {pantryItems.length > 0 && (
            <div className="space-y-3">
              <Label className="text-base font-medium">
                Or add from your pantry:
              </Label>
              <div className="flex flex-wrap gap-2">
                {pantryItems.map(item => (
                  <Button
                    key={item}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8"
                    disabled={loading}
                    onClick={() => addFromPantry(item)}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    {item}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {ingredients.length > 0 && (
            <div className="space-y-3">
              <Label className="text-base font-medium">
                Selected ingredients ({ingredients.length}):
              </Label>
              <div className="flex flex-wrap gap-2">
                {ingredients.map(ingredient => (
                  <Badge
                    key={ingredient}
                    variant="secondary"
                    className="flex items-center gap-1 px-3 py-1"
                  >
                    {ingredient}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      disabled={loading}
                      onClick={() => removeIngredient(ingredient)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="preferences" className="text-base font-medium">
              Any dietary preferences or restrictions?
            </Label>
            <Input
              id="preferences"
              type="text"
              value={preferences}
              placeholder="e.g., vegetarian, gluten-free, low-carb..."
              disabled={loading}
              onChange={e => setPreferences(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            disabled={loading || ingredients.length === 0}
            className="h-12 w-full text-base"
            size="lg"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Generating recipes...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <ChefHat className="h-5 w-5" />
                What should I cook?
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
