import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text, Button } from '@whats-for-dinner/ui';
import { Menu, User, ChefHat } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface NavbarProps {
  user: any;
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();

  return (
    <View className="bg-background border-b border-border px-4 py-3 flex-row justify-between items-center">
      <TouchableOpacity onPress={() => router.push('/')}>
        <View className="flex-row items-center space-x-2">
          <ChefHat size={24} color="#3b82f6" />
          <Text variant="h5" className="text-primary">
            What's for Dinner
          </Text>
        </View>
      </TouchableOpacity>

      <View className="flex-row items-center space-x-2">
        <TouchableOpacity onPress={() => router.push('/pantry')}>
          <Menu size={24} color="#64748b" />
        </TouchableOpacity>
        
        {user ? (
          <TouchableOpacity onPress={() => router.push('/profile')}>
            <User size={24} color="#64748b" />
          </TouchableOpacity>
        ) : (
          <Button variant="outline" size="sm">
            Sign In
          </Button>
        )}
      </View>
    </View>
  );
}