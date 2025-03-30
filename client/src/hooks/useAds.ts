import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { shouldShowAd } from '@/lib/adConfig';

/**
 * Hook for managing ad display throughout the application
 */
export function useAds() {
  const { user } = useAuth();
  const [isLoadingAd, setIsLoadingAd] = useState(false);
  const [isAdVisible, setIsAdVisible] = useState(false);
  
  // Check if we should show ads to this user
  const isPremiumUser = user?.isPremium || false;

  /**
   * Check if a specific ad type can be displayed based on frequency settings
   */
  const canShowAd = (adType: 'banner' | 'rectangle' | 'preroll' | 'interstitial' | 'anywhere' | 'multiplex'): boolean => {
    if (isPremiumUser) return false;
    return shouldShowAd(adType);
  };

  /**
   * Handler for when an ad starts loading
   */
  const handleAdLoading = () => {
    setIsLoadingAd(true);
  };

  /**
   * Handler for when an ad has loaded
   */
  const handleAdLoaded = () => {
    setIsLoadingAd(false);
    setIsAdVisible(true);
  };

  /**
   * Handler for when an ad is closed
   */
  const handleAdClosed = () => {
    setIsAdVisible(false);
  };

  return {
    isPremiumUser,
    isLoadingAd,
    isAdVisible,
    canShowAd,
    handleAdLoading,
    handleAdLoaded,
    handleAdClosed
  };
}