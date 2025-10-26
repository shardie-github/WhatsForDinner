import React from 'react';
import { cn } from '@whats-for-dinner/utils';

export interface SkeletonProps {
  children?: React.ReactNode;
  className?: string;
}

export function Skeleton({ children, className, ...props }: SkeletonProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(className)}
      {...props}
    >
      {children}
    </div>
  );
}
