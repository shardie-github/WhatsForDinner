import React from 'react';
import { cn } from '@whats-for-dinner/utils';

export interface ButtonProps {
  children: React.ReactNode;
  onPress?: (() => void) | undefined;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'brand' | 'accent' | 'destructive' | undefined;
  size?: 'sm' | 'md' | 'lg' | 'xl' | undefined;
  disabled?: boolean | undefined;
  loading?: boolean | undefined;
  className?: string | undefined;
  testID?: string | undefined;
}

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className,
  testID,
  ...props
}: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  
  const variantClasses = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700',
    secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 active:bg-secondary-700',
    brand: 'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700',
    accent: 'bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700',
    outline: 'border border-primary-500 bg-transparent text-primary-600 hover:bg-primary-50 active:bg-primary-100',
    ghost: 'bg-transparent text-primary-600 hover:bg-primary-50 active:bg-primary-100',
    destructive: 'bg-error-500 text-white hover:bg-error-600 active:bg-error-700',
  };
  
  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 py-2 text-base',
    lg: 'h-12 px-6 text-lg',
    xl: 'h-14 px-8 text-xl',
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        (disabled || loading) && 'opacity-50',
        className
      )}
      onClick={onPress}
      disabled={disabled || loading}
      data-testid={testID}
      {...props}
    >
      {loading ? (
        <span className="opacity-70">Loading...</span>
      ) : (
        children
      )}
    </button>
  );
}