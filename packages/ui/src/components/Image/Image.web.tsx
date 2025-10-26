import React from 'react';
import { cn } from '@whats-for-dinner/utils';

export interface ImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function Image({ src, alt, className, ...props }: ImageProps & React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src={src}
      alt={alt}
      className={cn(className)}
      {...props}
    />
  );
}