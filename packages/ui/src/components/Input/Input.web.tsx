import React from 'react';
import { cn } from '@whats-for-dinner/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
}

export function Input({ 
  className, 
  label,
  error,
  helperText,
  variant = 'default',
  size = 'md',
  ...props 
}: InputProps) {
  const baseClasses = 'flex w-full rounded-lg border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors';
  
  const variantClasses = {
    default: 'border-gray-300 focus-visible:border-primary-500',
    filled: 'border-0 bg-gray-100 focus-visible:bg-white focus-visible:ring-primary-500',
    outlined: 'border-2 border-gray-300 bg-transparent focus-visible:border-primary-500',
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
    error && 'border-error-500 focus-visible:ring-error-500',
    className
  );

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        className={inputClasses}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-error-600">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
}