import React from 'react';
import { cn } from '@whats-for-dinner/utils';

export interface ViewProps {
  children: React.ReactNode;
  className?: string;
}

export function View({ children, className, ...props }: ViewProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(className)}
      {...props}
    >
      {children}
    </div>
  );
}