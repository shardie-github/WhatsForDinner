import React from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card } from '@whats-for-dinner/ui';
import { Heart } from 'lucide-react-native';

export default function FavoritesScreen() {
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Refresh logic here
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-4 py-8">
        <Text variant="h1" className="mb-6">Favorites</Text>

        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Card className="p-8 items-center">
            <Heart size={48} color="#64748b" className="mb-4" />
            <Text variant="h3" className="text-center mb-4">
              No favorites yet
            </Text>
            <Text variant="body" className="text-center text-muted-foreground">
              Save recipes you love to see them here
            </Text>
          </Card>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}