// AdSense Configuration
export const ADSENSE_CONFIG = {
  publisherId: 'ca-pub-1318445400953510', // Actual AdSense Publisher ID
  enabled: true, // Can be toggled for testing
  testMode: process.env.NODE_ENV === 'development', // Use test ads in development
  slots: {
    anywhere: {
      id: '3300782881', // Anywhere ad responsive slot ID
      format: 'auto',
      responsive: true
    },
    multiplex: {
      id: '1987701211', // Multiplex ad slot ID
      format: 'autorelaxed',
      responsive: true
    },
    banner: {
      id: '3300782881', // Using the anywhere ad as fallback for banner format
      format: 'auto',
      responsive: true
    },
    rectangle: {
      id: '3300782881', // Using the anywhere ad as fallback for rectangle format
      format: 'auto',
      responsive: true
    },
    preroll: {
      id: '3300782881', // Using the anywhere ad as fallback for preroll
      format: 'auto',
      responsive: true
    },
    interstitial: {
      id: '3300782881', // Using the anywhere ad as fallback for interstitial
      format: 'auto',
      responsive: true
    }
  }
};

// Frequency settings
export const AD_FREQUENCY = {
  // How often to show banner ads in content (e.g., show after every 3 content items)
  inFeedFrequency: 3,
  
  // Time in seconds before preroll ads can be shown again to the same user
  prerollCooldown: 300, // 5 minutes
  
  // Time in seconds before interstitial ads can be shown again
  interstitialCooldown: 600 // 10 minutes
};

// Ad management functions
export function shouldShowAd(adType: 'banner' | 'rectangle' | 'preroll' | 'interstitial' | 'anywhere' | 'multiplex'): boolean {
  if (!ADSENSE_CONFIG.enabled) return false;
  
  // Check if we're in cooldown period for certain ad types
  if (adType === 'preroll' || adType === 'interstitial') {
    const lastShown = getLastAdShownTime(adType);
    const cooldownPeriod = adType === 'preroll' 
      ? AD_FREQUENCY.prerollCooldown 
      : AD_FREQUENCY.interstitialCooldown;
      
    if (lastShown && (Date.now() - lastShown) < cooldownPeriod * 1000) {
      return false;
    }
  }
  
  return true;
}

// Track when ads were last shown
export function recordAdImpression(adType: string): void {
  try {
    localStorage.setItem(`ad_last_shown_${adType}`, Date.now().toString());
  } catch (e) {
    console.error('Failed to record ad impression:', e);
  }
}

// Get timestamp of last ad shown
function getLastAdShownTime(adType: string): number | null {
  try {
    const timestamp = localStorage.getItem(`ad_last_shown_${adType}`);
    return timestamp ? parseInt(timestamp) : null;
  } catch (e) {
    console.error('Failed to get last ad shown time:', e);
    return null;
  }
}

// Get ad slot information
export function getAdSlotConfig(type: 'banner' | 'rectangle' | 'preroll' | 'interstitial' | 'anywhere' | 'multiplex') {
  return ADSENSE_CONFIG.slots[type];
}