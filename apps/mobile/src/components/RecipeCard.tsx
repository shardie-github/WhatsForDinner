import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { Text, Button, Card } from '@whats-for-dinner/ui';
import { Recipe } from '@whats-for-dinner/utils';
import { Clock, Users, ChefHat } from 'lucide-react-native';

interface RecipeCardProps {
  recipe: Recipe;
  onSave: () => void;
  canSave: boolean;
}

export function RecipeCard({ recipe, onSave, canSave }: RecipeCardProps) {
  return (
    <Card className="p-4 space-y-3">
      <View className="space-y-2">
        <Text variant="h3" className="text-primary">
          {recipe.title}
        </Text>
        {recipe.description && (
          <Text variant="body" className="text-muted-foreground">
            {recipe.description}
          </Text>
        )}
      </View>

      {recipe.imageUrl && (
        <Image
          source={{ uri: recipe.imageUrl }}
          className="w-full h-48 rounded-lg"
          resizeMode="cover"
        />
      )}

      <View className="flex-row justify-between items-center">
        <View className="flex-row space-x-4">
          <View className="flex-row items-center space-x-1">
            <Clock size={16} color="#64748b" />
            <Text variant="small">{recipe.prepTime + recipe.cookTime}m</Text>
          </View>
          <View className="flex-row items-center space-x-1">
            <Users size={16} color="#64748b" />
            <Text variant="small">{recipe.servings} servings</Text>
          </View>
          <View className="flex-row items-center space-x-1">
            <ChefHat size={16} color="#64748b" />
            <Text variant="small" className="capitalize">
              {recipe.difficulty}
            </Text>
          </View>
        </View>
      </View>

      <View className="space-y-2">
        <Text variant="h5">Ingredients</Text>
        <Text variant="body" className="text-muted-foreground">
          {recipe.ingredients.join(', ')}
        </Text>
      </View>

      <View className="space-y-2">
        <Text variant="h5">Instructions</Text>
        {recipe.instructions.map((instruction, index) => (
          <Text key={index} variant="body" className="text-muted-foreground">
            {index + 1}. {instruction}
          </Text>
        ))}
      </View>

      {canSave && (
        <Button onPress={onSave} className="w-full">
          Save Recipe
        </Button>
      )}

      {recipe.tags && recipe.tags.length > 0 && (
        <View className="flex-row flex-wrap space-x-2">
          {recipe.tags.map((tag, index) => (
            <View
              key={index}
              className="bg-secondary px-2 py-1 rounded-full"
            >
              <Text variant="small">{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}