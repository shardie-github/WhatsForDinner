import React from 'react';
import { View } from 'react-native';
import { cn } from '@whats-for-dinner/utils';

export interface SafeAreaViewProps {
  children?: React.ReactNode;
  className?: string;
}

export function SafeAreaView({ children, className, ...props }: SafeAreaViewProps) {
  return (
    <View
      className={cn(className)}
      {...props}
    >
      {children}
    </View>
  );
}
