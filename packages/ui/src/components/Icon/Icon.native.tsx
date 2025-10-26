import React from 'react';
import { Text } from 'react-native';
import { cn } from '@whats-for-dinner/utils';

export interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

export function Icon({ name, className, size = 24, ...props }: IconProps) {
  return (
    <Text
      className={cn(className)}
      style={{ fontSize: size }}
      {...props}
    >
      {name}
    </Text>
  );
}