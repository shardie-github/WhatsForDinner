import React from 'react';
import { View } from 'react-native';
import { cn } from '@whats-for-dinner/utils';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <View
      className={cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </View>
  );
}