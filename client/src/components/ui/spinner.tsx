import React from 'react';
import { cn } from '@/lib/utils';

export enum SpinnerSize {
  XS = 'xs',
  SM = 'sm',
  MD = 'md',
  LG = 'lg',
  XL = 'xl',
}

export interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
  color?: string;
}

const sizeClasses = {
  [SpinnerSize.XS]: 'w-4 h-4 border-2',
  [SpinnerSize.SM]: 'w-6 h-6 border-2',
  [SpinnerSize.MD]: 'w-8 h-8 border-2',
  [SpinnerSize.LG]: 'w-12 h-12 border-3',
  [SpinnerSize.XL]: 'w-16 h-16 border-4',
};

export function Spinner({ 
  size = SpinnerSize.MD, 
  className = '',
  color = 'border-primary'
}: SpinnerProps) {
  return (
    <div 
      className={cn(
        'inline-block rounded-full border-solid border-t-transparent animate-spin',
        sizeClasses[size],
        color,
        className
      )}
      role="status"
      aria-label="loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}