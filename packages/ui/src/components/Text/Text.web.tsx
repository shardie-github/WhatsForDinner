import React from 'react';
import { cn } from '@whats-for-dinner/utils';

export interface TextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'caption' | 'small';
  className?: string;
  testID?: string;
}

export function Text({
  children,
  variant = 'body',
  className,
  testID,
  ...props
}: TextProps & React.HTMLAttributes<HTMLParagraphElement>) {
  const variantClasses = {
    h1: 'text-4xl font-bold leading-tight',
    h2: 'text-3xl font-semibold leading-tight',
    h3: 'text-2xl font-semibold leading-snug',
    h4: 'text-xl font-semibold leading-snug',
    h5: 'text-lg font-medium leading-normal',
    h6: 'text-base font-medium leading-normal',
    body: 'text-base leading-normal',
    caption: 'text-sm text-muted-foreground',
    small: 'text-xs text-muted-foreground',
  };

  const Component = variant.startsWith('h') ? (variant as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6') : 'p';

  return (
    <Component
      className={cn(variantClasses[variant], className)}
      data-testid={testID}
      {...props}
    >
      {children}
    </Component>
  );
}