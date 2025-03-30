import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

interface VideoCardSkeletonProps {
  className?: string;
}

export function VideoCardSkeleton({ className }: VideoCardSkeletonProps) {
  return (
    <Card className={`overflow-hidden ${className}`}>
      {/* Thumbnail skeleton */}
      <div className="relative aspect-video">
        <Skeleton className="absolute inset-0 w-full h-full" />
        
        {/* Play button skeleton */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Skeleton className="w-12 h-12 rounded-full" />
        </div>
        
        {/* Badge skeleton */}
        <div className="absolute top-2 right-2">
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
      
      <CardContent className="p-3">
        {/* Title skeleton */}
        <Skeleton className="h-5 w-full mb-2" />
        
        {/* Description skeleton - two lines */}
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
      
      <CardFooter className="p-3 pt-0 flex justify-between">
        {/* Duration skeleton */}
        <Skeleton className="h-4 w-12" />
        
        {/* Year skeleton */}
        <Skeleton className="h-4 w-10" />
      </CardFooter>
    </Card>
  );
}

export function VideoCardSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array(count).fill(0).map((_, index) => (
        <VideoCardSkeleton key={index} />
      ))}
    </div>
  );
}