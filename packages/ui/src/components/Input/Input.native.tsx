import React from 'react';
import { TextInput, View, Text } from 'react-native';
import { cn } from '@whats-for-dinner/utils';

export interface InputProps {
  className?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  testID?: string;
}

export function Input({ 
  className, 
  label,
  error,
  helperText,
  variant = 'default',
  size = 'md',
  testID,
  ...props 
}: InputProps) {
  const baseClasses = 'flex w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500';
  
  const variantClasses = {
    default: 'border-gray-300 focus:border-primary-500',
    filled: 'border-0 bg-gray-100 focus:bg-white',
    outlined: 'border-2 border-gray-300 bg-transparent focus:border-primary-500',
  };
  
  const sizeClasses = {
    sm: 'h-8 px-2 text-xs',
    md: 'h-10 px-3 text-sm',
    lg: 'h-12 px-4 text-base',
  };

  const inputClasses = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    error && 'border-error-500',
    className
  );

  return (
    <View className="w-full">
      {label && (
        <Text className="text-sm font-medium text-gray-700 mb-1">
          {label}
        </Text>
      )}
      <TextInput
        className={inputClasses}
        testID={testID}
        {...props}
      />
      {error && (
        <Text className="mt-1 text-sm text-error-600">
          {error}
        </Text>
      )}
      {helperText && !error && (
        <Text className="mt-1 text-sm text-gray-500">
          {helperText}
        </Text>
      )}
    </View>
  );
}