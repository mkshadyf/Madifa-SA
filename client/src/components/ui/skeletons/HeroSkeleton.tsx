import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface HeroSkeletonProps {
  className?: string;
}

export function HeroSkeleton({ className }: HeroSkeletonProps) {
  return (
    <div className={`relative w-full ${className}`}>
      {/* Hero background skeleton */}
      <div className="relative aspect-[21/9] sm:aspect-[21/7] w-full overflow-hidden rounded-lg">
        <Skeleton className="absolute inset-0 w-full h-full" />
      </div>
      
      {/* Content overlay positioned at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background/90 to-background/0">
        <div className="max-w-3xl">
          {/* Title skeleton */}
          <Skeleton className="h-8 w-2/3 mb-3" />
          
          {/* Description skeleton - three lines */}
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-2/3 mb-4" />
          
          {/* Buttons skeleton */}
          <div className="flex gap-3">
            <Skeleton className="h-10 w-28 rounded-md" />
            <Skeleton className="h-10 w-32 rounded-md" />
          </div>
          
          {/* Metadata row skeleton */}
          <div className="flex gap-3 mt-4">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}