import { useState, useEffect } from 'react';
import { useAdsense } from '@/hooks/useAdsense';
import AdDisplay from './AdDisplay';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface PreRollAdProps {
  videoId: number | string;
  onComplete: () => void;
  className?: string;
}

/**
 * Component for displaying pre-roll ads before video content
 */
export default function PreRollAd({ videoId, onComplete, className = '' }: PreRollAdProps) {
  const { canShowAdType } = useAdsense();
  const [shouldShow, setShouldShow] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(5); // 5 second countdown
  
  // Check if we should display the pre-roll ad
  useEffect(() => {
    setShouldShow(canShowAdType('preroll'));
  }, [canShowAdType]);
  
  // Handle countdown timer
  useEffect(() => {
    if (!shouldShow || isComplete) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          clearInterval(timer);
          setIsComplete(true);
          return 0;
        }
        return newTime;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [shouldShow, isComplete]);
  
  // Handle completing the ad
  useEffect(() => {
    if (isComplete) {
      onComplete();
    }
  }, [isComplete, onComplete]);
  
  // If we shouldn't show the ad, complete immediately
  useEffect(() => {
    if (!shouldShow) {
      onComplete();
    }
  }, [shouldShow, onComplete]);
  
  if (!shouldShow) {
    return null;
  }
  
  return (
    <div className={`fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50 ${className}`}>
      <div className="relative w-full max-w-2xl mx-auto">
        <div className="absolute top-2 right-2 z-10">
          {/* Skip button - only enabled after countdown */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsComplete(true)}
            disabled={timeRemaining > 0}
            className="text-white bg-black/50 hover:bg-black/70"
          >
            {timeRemaining > 0 ? (
              <span>Skip ad in {timeRemaining}s</span>
            ) : (
              <span className="flex items-center">
                Skip Ad <X className="ml-1 h-4 w-4" />
              </span>
            )}
          </Button>
        </div>
        
        <AdDisplay 
          type="preroll" 
          className="w-full"
          onAdLoaded={() => console.log('Pre-roll ad loaded')}
          onAdClosed={() => setIsComplete(true)}
        />
      </div>
      
      <div className="mt-4 text-sm text-white/80">
        Your video will begin shortly
      </div>
    </div>
  );
}