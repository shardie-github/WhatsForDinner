import React from 'react';
import { cn } from '@whats-for-dinner/utils';

export interface SafeAreaViewProps {
  children?: React.ReactNode;
  className?: string;
}

export function SafeAreaView({ children, className, ...props }: SafeAreaViewProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(className)}
      {...props}
    >
      {children}
    </div>
  );
}
