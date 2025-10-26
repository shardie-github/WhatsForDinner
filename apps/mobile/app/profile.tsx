import React from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Card } from '@whats-for-dinner/ui';
import { User, Settings, LogOut } from 'lucide-react-native';

export default function ProfileScreen() {
  const handleSignOut = () => {
    // Sign out logic
    console.log('Sign out');
  };

  const handleSettings = () => {
    // Navigate to settings
    console.log('Settings');
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-4 py-8">
        <Text variant="h1" className="mb-6">Profile</Text>

        <ScrollView className="flex-1">
          <Card className="p-6 mb-6">
            <View className="items-center mb-6">
              <View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center mb-4">
                <User size={32} color="#3b82f6" />
              </View>
              <Text variant="h3">Guest User</Text>
              <Text variant="body" className="text-muted-foreground">
                Sign in to save your recipes and preferences
              </Text>
            </View>
            
            <Button className="w-full mb-4">
              Sign In
            </Button>
          </Card>

          <View className="space-y-4">
            <Card className="p-4">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onPress={handleSettings}
              >
                <View className="flex-row items-center space-x-3">
                  <Settings size={20} color="#64748b" />
                  <Text>Settings</Text>
                </View>
              </Button>
            </Card>

            <Card className="p-4">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onPress={handleSignOut}
              >
                <View className="flex-row items-center space-x-3">
                  <LogOut size={20} color="#64748b" />
                  <Text>Sign Out</Text>
                </View>
              </Button>
            </Card>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}