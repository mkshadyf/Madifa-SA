import { useState, useEffect } from 'react';
import { useAdsense } from '@/hooks/useAdsense';
import AdDisplay from './AdDisplay';
import { Skeleton } from '@/components/ui/skeleton';

interface InFeedAdProps {
  index: number;
  contentLength: number;
  className?: string;
}

/**
 * Component for displaying ads within content feeds
 * It will only display ads at certain indices determined by the ad frequency
 */
export default function InFeedAd({ index, contentLength, className = '' }: InFeedAdProps) {
  const { canShowAds, getInFeedAdPositions } = useAdsense();
  const [shouldShow, setShouldShow] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!canShowAds) return;
    
    // Get the positions where ads should appear
    const adPositions = getInFeedAdPositions(contentLength);
    
    // Check if current index should display an ad
    setShouldShow(adPositions.includes(index));
    
    // Simulate ad loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [index, contentLength, canShowAds, getInFeedAdPositions]);
  
  if (!canShowAds || !shouldShow) {
    return null;
  }
  
  return (
    <div className={`my-4 w-full ${className}`}>
      {isLoading ? (
        <Skeleton className="w-full h-[90px] rounded-md" />
      ) : (
        <AdDisplay 
          type="banner" 
          className="w-full"
          onAdLoaded={() => console.log('In-feed ad loaded')} 
        />
      )}
    </div>
  );
}