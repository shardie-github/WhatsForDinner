import React from 'react';
import { TextInput } from 'react-native';
import { cn } from '@whats-for-dinner/utils';

export interface InputProps {
  className?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
}

export function Input({ className, ...props }: InputProps) {
  return (
    <TextInput
      className={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}