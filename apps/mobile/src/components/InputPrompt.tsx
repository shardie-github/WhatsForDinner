import React, { useState } from 'react';
import { View, TextInput, ScrollView } from 'react-native';
import { Text, Button, Card } from '@whats-for-dinner/ui';
import { Plus, X } from 'lucide-react-native';

interface InputPromptProps {
  onGenerate: (ingredients: string[], preferences: string) => void;
  loading: boolean;
  pantryItems: string[];
}

export function InputPrompt({ onGenerate, loading, pantryItems }: InputPromptProps) {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [preferences, setPreferences] = useState('');

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

  const handleGenerate = () => {
    if (ingredients.length > 0) {
      onGenerate(ingredients, preferences);
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <Text variant="h3">What's in your pantry?</Text>
      
      {/* Pantry Items */}
      {pantryItems.length > 0 && (
        <View className="space-y-2">
          <Text variant="h5">From your pantry:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-2">
              {pantryItems.map((item, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onPress={() => addFromPantry(item)}
                  disabled={ingredients.includes(item)}
                >
                  {item}
                </Button>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Selected Ingredients */}
      {ingredients.length > 0 && (
        <View className="space-y-2">
          <Text variant="h5">Selected ingredients:</Text>
          <View className="flex-row flex-wrap space-x-2 space-y-2">
            {ingredients.map((ingredient, index) => (
              <View
                key={index}
                className="bg-primary/10 border border-primary rounded-full px-3 py-1 flex-row items-center space-x-2"
              >
                <Text variant="small" className="text-primary">
                  {ingredient}
                </Text>
                <TouchableOpacity onPress={() => removeIngredient(ingredient)}>
                  <X size={16} color="#3b82f6" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Add New Ingredient */}
      <View className="space-y-2">
        <Text variant="h5">Add ingredient:</Text>
        <View className="flex-row space-x-2">
          <TextInput
            className="flex-1 border border-input rounded-md px-3 py-2"
            placeholder="Enter ingredient name"
            value={newIngredient}
            onChangeText={setNewIngredient}
            onSubmitEditing={addIngredient}
          />
          <Button onPress={addIngredient} size="sm">
            <Plus size={16} />
          </Button>
        </View>
      </View>

      {/* Preferences */}
      <View className="space-y-2">
        <Text variant="h5">Any preferences?</Text>
        <TextInput
          className="border border-input rounded-md px-3 py-2"
          placeholder="e.g., vegetarian, quick meals, spicy food"
          value={preferences}
          onChangeText={setPreferences}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Generate Button */}
      <Button
        onPress={handleGenerate}
        disabled={ingredients.length === 0 || loading}
        className="w-full"
      >
        {loading ? 'Generating...' : 'Generate Recipes'}
      </Button>
    </Card>
  );
}