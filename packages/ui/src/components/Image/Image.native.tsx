import React from 'react';
import { Image as RNImage } from 'react-native';
import { cn } from '@whats-for-dinner/utils';

export interface ImageProps {
  source: { uri: string };
  className?: string;
}

export function Image({ source, className, ...props }: ImageProps) {
  return (
    <RNImage
      source={source}
      className={cn(className)}
      {...props}
    />
  );
}