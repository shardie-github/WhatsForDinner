import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { cn } from '@whats-for-dinner/utils';

export interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  testID?: string;
}

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className,
  testID,
  ...props
}: ButtonProps) {
  const baseClasses = 'flex-row items-center justify-center rounded-md font-medium';
  
  const variantClasses = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    outline: 'border border-input bg-background',
    ghost: 'bg-transparent',
  };
  
  const sizeClasses = {
    sm: 'h-9 px-3',
    md: 'h-10 px-4 py-2',
    lg: 'h-11 px-8',
  };

  const textClasses = cn(
    'text-center font-medium',
    variant === 'primary' || variant === 'secondary' ? 'text-white' : 'text-foreground'
  );

  return (
    <TouchableOpacity
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        disabled && 'opacity-50',
        className
      )}
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      activeOpacity={0.7}
      {...props}
    >
      <Text className={textClasses}>{children}</Text>
    </TouchableOpacity>
  );
}