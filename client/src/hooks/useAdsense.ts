import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ADSENSE_CONFIG, shouldShowAd, AD_FREQUENCY } from '@/lib/adConfig';

type AdType = 'banner' | 'rectangle' | 'preroll' | 'interstitial';

interface AdsenseHookResult {
  // Whether the current user should see ads
  canShowAds: boolean;
  
  // Check if specific ad type can be shown (respects frequency settings)
  canShowAdType: (type: AdType) => boolean;
  
  // Get in-feed ad positions based on content array length
  getInFeedAdPositions: (contentLength: number) => number[];
  
  // For premium features: notify user they need premium
  showPremiumFeaturePrompt: () => void;
  
  // AdSense is initialized and ready
  isAdsenseInitialized: boolean;
}

export function useAdsense(): AdsenseHookResult {
  const { user } = useAuth();
  const [isAdsenseInitialized, setIsAdsenseInitialized] = useState(false);
  
  // Check if ads can be shown to this user
  const canShowAds = !user?.isPremium && ADSENSE_CONFIG.enabled;
  
  // Initialize AdSense
  useEffect(() => {
    if (typeof window === 'undefined' || !canShowAds) return;
    
    // Check if AdSense script is already loaded
    if (document.querySelector('script[src*="adsbygoogle.js"]')) {
      setIsAdsenseInitialized(true);
      return;
    }
    
    try {
      // Create and append AdSense script
      const script = document.createElement('script');
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CONFIG.publisherId}`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.onload = () => setIsAdsenseInitialized(true);
      script.onerror = (error) => {
        console.error('AdSense script failed to load:', error);
        setIsAdsenseInitialized(false);
      };
      
      document.head.appendChild(script);
      
      return () => {
        // Clean up (though browsers generally won't remove script tags)
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    } catch (error) {
      console.error('Error initializing AdSense:', error);
    }
  }, [canShowAds]);
  
  // Check if a specific ad type can be shown
  const canShowAdType = (type: AdType): boolean => {
    if (!canShowAds) return false;
    return shouldShowAd(type);
  };
  
  // Get positions where in-feed ads should appear
  const getInFeedAdPositions = (contentLength: number): number[] => {
    if (!canShowAds || contentLength <= 1) return [];
    
    const positions: number[] = [];
    const frequency = AD_FREQUENCY.inFeedFrequency;
    
    // Generate ad positions based on frequency
    for (let i = frequency - 1; i < contentLength; i += frequency) {
      positions.push(i);
    }
    
    return positions;
  };
  
  // Show a prompt for premium features
  const showPremiumFeaturePrompt = () => {
    // This could open a subscription modal or redirect to subscription page
    // You would implement this based on your UI/UX flow
    console.log('Premium feature prompt would show here');
    // Could trigger a toast or modal in a real implementation
  };
  
  return {
    canShowAds,
    canShowAdType,
    getInFeedAdPositions,
    showPremiumFeaturePrompt,
    isAdsenseInitialized
  };
}