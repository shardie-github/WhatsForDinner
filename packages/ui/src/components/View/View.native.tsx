import React from 'react';
import { View as RNView } from 'react-native';
import { cn } from '@whats-for-dinner/utils';

export interface ViewProps {
  children: React.ReactNode;
  className?: string;
}

export function View({ children, className, ...props }: ViewProps) {
  return (
    <RNView
      className={cn(className)}
      {...props}
    >
      {children}
    </RNView>
  );
}