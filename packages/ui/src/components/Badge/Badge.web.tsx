import React from 'react';
import { cn } from '@whats-for-dinner/utils';

export interface BadgeProps {
  children?: React.ReactNode;
  className?: string;
}

export function Badge({ children, className, ...props }: BadgeProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(className)}
      {...props}
    >
      {children}
    </div>
  );
}
