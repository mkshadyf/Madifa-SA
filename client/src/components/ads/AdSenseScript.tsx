import { useEffect } from 'react';
import { ADSENSE_CONFIG } from '@/lib/adConfig';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Component that initializes AdSense by adding the script to the head.
 * This should be used in the main App component.
 */
export function AdSenseScript() {
  const { user } = useAuth();
  
  // Don't add AdSense script for premium users
  const shouldLoadAdsense = !user?.isPremium && ADSENSE_CONFIG.enabled;
  
  useEffect(() => {
    if (!shouldLoadAdsense || typeof window === 'undefined') return;
    
    // Check for publisher ID
    if (!ADSENSE_CONFIG.publisherId) {
      console.warn('AdSense publisher ID not configured. Set VITE_ADSENSE_PUBLISHER_ID in environment variables.');
      return;
    }
    
    // Early return if the script is already added
    if (document.querySelector('script[src*="adsbygoogle.js"]')) {
      return;
    }
    
    // Create AdSense script element
    const script = document.createElement('script');
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CONFIG.publisherId}`;
    script.async = true;
    script.crossOrigin = "anonymous";
    
    // Add to document head
    document.head.appendChild(script);
    
    // Initialize AdSense if the auto-initialization is turned off
    (window.adsbygoogle = window.adsbygoogle || []).push({});
    
    // Clean up function (browser generally won't remove script tags)
    return () => {
      try {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      } catch (e) {
        console.error('Error removing AdSense script:', e);
      }
    };
  }, [shouldLoadAdsense]);
  
  // Component doesn't render anything visible
  return null;
}

/**
 * For TypeScript compatibility
 */
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}