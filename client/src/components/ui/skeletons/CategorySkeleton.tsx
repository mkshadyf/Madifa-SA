import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { VideoCardSkeleton } from './VideoCardSkeleton';

interface CategorySkeletonProps {
  className?: string;
  cardsCount?: number;
}

export function CategorySkeleton({ className, cardsCount = 5 }: CategorySkeletonProps) {
  return (
    <div className={`mb-8 ${className}`}>
      {/* Category header skeleton */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        
        {/* View all link skeleton */}
        <Skeleton className="h-4 w-20" />
      </div>
      
      {/* Cards row */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {Array(cardsCount).fill(0).map((_, index) => (
          <div key={index} className="flex-none w-[260px]">
            <VideoCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CategoriesListSkeleton({ categories = 3 }: { categories?: number }) {
  return (
    <div>
      {Array(categories).fill(0).map((_, index) => (
        <CategorySkeleton key={index} />
      ))}
    </div>
  );
}