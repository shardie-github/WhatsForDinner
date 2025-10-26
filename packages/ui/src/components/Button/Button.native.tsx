import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle } from 'react-native';
import { cn } from '@whats-for-dinner/utils';

export interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  testID?: string;
  style?: ViewStyle;
}

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className,
  testID,
  style,
  ...props
}: ButtonProps) {
  const baseStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  };
  
  const variantStyles: Record<string, ViewStyle> = {
    primary: {
      backgroundColor: '#3b82f6',
    },
    secondary: {
      backgroundColor: '#64748b',
    },
    outline: {
      borderWidth: 1,
      borderColor: '#e2e8f0',
      backgroundColor: 'transparent',
    },
    ghost: {
      backgroundColor: 'transparent',
    },
  };
  
  const sizeStyles: Record<string, ViewStyle> = {
    sm: {
      height: 36,
      paddingHorizontal: 12,
    },
    md: {
      height: 40,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    lg: {
      height: 44,
      paddingHorizontal: 32,
    },
  };

  const textStyle: TextStyle = {
    color: variant === 'primary' || variant === 'secondary' ? 'white' : '#374151',
    fontWeight: '500',
  };

  return (
    <TouchableOpacity
      style={[
        baseStyle,
        variantStyles[variant],
        sizeStyles[size],
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      activeOpacity={0.7}
      {...props}
    >
      <Text style={textStyle}>{children}</Text>
    </TouchableOpacity>
  );
}