import React from 'react';
import { View } from 'react-native';
import { cn } from '@whats-for-dinner/utils';

export interface BadgeProps {
  children?: React.ReactNode;
  className?: string;
}

export function Badge({ children, className, ...props }: BadgeProps) {
  return (
    <View
      className={cn(className)}
      {...props}
    >
      {children}
    </View>
  );
}
