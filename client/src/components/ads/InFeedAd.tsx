import { useState, useEffect } from 'react';
import { useAds } from '@/hooks/useAds';
import AdDisplay from './AdDisplay';
import { Skeleton } from '@/components/ui/skeleton';

interface InFeedAdProps {
  index: number; // Position in the content list
  frequency?: number; // How often should ads appear (default: every 3 items)
  type?: 'banner' | 'rectangle' | 'anywhere'; // Type of ad to display
  className?: string;
  forceShow?: boolean; // Override frequency checks (useful for testing)
}

/**
 * Component for displaying ads within content feeds at specified intervals
 */
const InFeedAd = ({ 
  index, 
  frequency = 3, 
  type = 'anywhere',
  className = '',
  forceShow = false
}: InFeedAdProps) => {
  const { isPremiumUser, canShowAd, isLoadingAd, handleAdLoaded } = useAds();
  const [shouldShow, setShouldShow] = useState(false);
  
  useEffect(() => {
    // Determine if we should show an ad at this position
    // Show ads at positions that are multiples of the frequency (e.g., 3, 6, 9, etc.)
    if (forceShow || (!isPremiumUser && (index + 1) % frequency === 0 && canShowAd(type))) {
      setShouldShow(true);
    } else {
      setShouldShow(false);
    }
  }, [index, frequency, isPremiumUser, canShowAd, type, forceShow]);
  
  if (!shouldShow) {
    return null;
  }
  
  return (
    <div className={`my-4 ${className}`}>
      {isLoadingAd ? (
        <Skeleton className="w-full h-[200px] rounded-lg" />
      ) : (
        <AdDisplay 
          type={type} 
          onAdLoaded={handleAdLoaded}
          forceShow={forceShow}
        />
      )}
    </div>
  );
};

export default InFeedAd;