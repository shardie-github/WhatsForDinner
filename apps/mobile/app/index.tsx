import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, Text as RNText } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Card, ThemeToggle } from '@whats-for-dinner/ui';
import { useDeviceInfo, useTheme } from '@whats-for-dinner/utils';
import { RecipeCard } from '../src/components/RecipeCard';
import { InputPrompt } from '../src/components/InputPrompt';
import { Navbar } from '../src/components/Navbar';
import { useGenerateRecipes, useSaveRecipe } from '../src/hooks/useRecipes';
import { usePantryItems } from '../src/hooks/usePantry';
import { Recipe } from '@whats-for-dinner/utils';

export default function HomeScreen() {
  const [user, setUser] = useState<any>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const deviceInfo = useDeviceInfo();
  const { isDark } = useTheme();
  const generateRecipesMutation = useGenerateRecipes();
  const saveRecipeMutation = useSaveRecipe();
  const { data: pantryItems = [], isLoading: pantryLoading } = usePantryItems();

  const pantryItemNames = (pantryItems as any[]).map(item => item.ingredient);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Refresh logic here
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const generateRecipes = async (ingredients: string[], preferences: string) => {
    try {
      const result = await generateRecipesMutation.mutateAsync({
        ingredients,
        preferences,
      });
      setRecipes(result.recipes);
    } catch (error) {
      console.error('Error generating recipes:', error);
    }
  };

  const saveRecipe = async (recipe: Recipe) => {
    if (!user) return;
    try {
      await saveRecipeMutation.mutateAsync(recipe);
    } catch (error) {
      console.error('Error saving recipe:', error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <View className="flex-row items-center space-x-2">
          <RNText className="text-2xl">🥘</RNText>
          <Text className="text-xl font-display font-bold text-brand-600">
            What's for Dinner?
          </Text>
        </View>
        <ThemeToggle />
      </View>
      
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="flex-1 px-4 py-8">
          {/* Hero Section */}
          <View className="items-center space-y-6 mb-8">
            <Text className="text-3xl font-display font-bold text-center text-brand-600">
              What's for Dinner?
            </Text>
            <Text className="text-base text-center text-gray-600">
              Get AI-powered meal suggestions based on your pantry and preferences
            </Text>
          </View>

          {/* Input Section */}
          <View className="mb-8">
            <InputPrompt
              onGenerate={generateRecipes}
              loading={generateRecipesMutation.isPending}
              pantryItems={pantryItemNames}
            />
          </View>

          {/* Loading State */}
          {generateRecipesMutation.isPending && (
            <View className="space-y-6">
              <Text variant="h2" className="text-center">
                Generating Recipes...
              </Text>
              <View className="space-y-4">
                <Card className="p-4">
                  <Text>Loading recipe 1...</Text>
                </Card>
                <Card className="p-4">
                  <Text>Loading recipe 2...</Text>
                </Card>
                <Card className="p-4">
                  <Text>Loading recipe 3...</Text>
                </Card>
              </View>
            </View>
          )}

          {/* Results Section */}
          {recipes.length > 0 && !generateRecipesMutation.isPending && (
            <View className="space-y-6">
              <Text variant="h2" className="text-center">
                Suggested Recipes
              </Text>
              <Text variant="body" className="text-center text-muted-foreground">
                Found {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} for you
              </Text>
              <View className="space-y-4">
                {recipes.map((recipe, index) => (
                  <RecipeCard
                    key={index}
                    recipe={recipe}
                    onSave={() => saveRecipe(recipe)}
                    canSave={!!user}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Error State */}
          {generateRecipesMutation.error && (
            <Card className="border-error bg-error/5 p-4">
              <Text className="text-error">
                Error generating recipes: {generateRecipesMutation.error.message}
              </Text>
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}