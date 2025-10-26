import React from 'react';
import { View } from 'react-native';
import { cn } from '@whats-for-dinner/utils';

export interface SkeletonProps {
  children?: React.ReactNode;
  className?: string;
}

export function Skeleton({ children, className, ...props }: SkeletonProps) {
  return (
    <View
      className={cn(className)}
      {...props}
    >
      {children}
    </View>
  );
}
