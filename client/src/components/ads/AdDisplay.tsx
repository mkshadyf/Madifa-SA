import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { insertAdsByGoogle } from "@/lib/helpers";
import { useAuth } from "@/contexts/AuthContext";
import { ADSENSE_CONFIG, shouldShowAd, recordAdImpression, getAdSlotConfig } from "@/lib/adConfig";
import { X, ExternalLink } from "lucide-react";

interface AdDisplayProps {
  type: "banner" | "interstitial" | "preroll" | "rectangle";
  className?: string;
  onAdLoaded?: () => void;
  onAdClosed?: () => void;
  forceShow?: boolean; // Override ad frequency checks for testing
}

const AdDisplay = ({ 
  type, 
  className = "", 
  onAdLoaded, 
  onAdClosed,
  forceShow = false
}: AdDisplayProps) => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [showCloseButton, setShowCloseButton] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);
  const adContainerRef = useRef<HTMLDivElement>(null);
  
  // Don't show ads for premium users
  if (user?.isPremium) {
    return null;
  }
  
  // Check ad frequency unless forced to show
  if (!forceShow && !shouldShowAd(type)) {
    return null;
  }
  
  // Determine ad dimensions based on type
  let adDimensions = {
    width: "100%",
    height: "90px"
  };
  
  switch (type) {
    case "banner":
      adDimensions = { width: "100%", height: "90px" };
      break;
    case "rectangle":
      adDimensions = { width: "300px", height: "250px" };
      break;
    case "interstitial":
      adDimensions = { width: "100%", height: "400px" };
      break;
    case "preroll":
      adDimensions = { width: "100%", height: "300px" };
      break;
  }
  
  useEffect(() => {
    // Record the ad impression attempt
    recordAdImpression(type);
    
    // Insert Google AdSense ad
    try {
      insertAdsByGoogle();
      
      // Simulate ad loading (in a real app, the adsbygoogle push would trigger this)
      const timer = setTimeout(() => {
        setAdLoaded(true);
        if (onAdLoaded) onAdLoaded();
        
        // For interstitial and preroll ads, show close button after a delay
        if (type === "interstitial" || type === "preroll") {
          const closeTimer = setTimeout(() => {
            setShowCloseButton(true);
          }, 5000); // 5 seconds delay before showing close button
          
          return () => clearTimeout(closeTimer);
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    } catch (error) {
      console.error('Ad loading error:', error);
      setAdError(true);
    }
  }, [type, onAdLoaded]);
  
  const handleClose = () => {
    setIsVisible(false);
    if (onAdClosed) onAdClosed();
  };
  
  if (!isVisible) {
    return null;
  }
  
  // Get slot configuration
  const slotConfig = getAdSlotConfig(type);
  
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-0 relative">
        {/* Ad Container */}
        <div 
          ref={adContainerRef}
          className="bg-muted/50 flex items-center justify-center"
          style={{ width: adDimensions.width, height: adDimensions.height }}
        >
          {!adLoaded && !adError && (
            <div className="flex flex-col items-center justify-center space-y-1">
              <div className="animate-pulse w-8 h-8 rounded-full bg-muted-foreground/20"></div>
              <div className="text-xs text-muted-foreground">Loading advertisement...</div>
            </div>
          )}
          
          {adError && (
            <div className="flex flex-col items-center justify-center">
              <div className="text-xs text-muted-foreground">Ad content unavailable</div>
            </div>
          )}
          
          <div 
            className="adsbygoogle absolute inset-0"
            style={{ 
              display: "block", 
              width: adDimensions.width, 
              height: adDimensions.height 
            }}
            data-ad-client={ADSENSE_CONFIG.publisherId}
            data-ad-slot={slotConfig.id}
            data-ad-format={slotConfig.format}
            data-full-width-responsive={slotConfig.responsive ? "true" : "false"}
          ></div>
        </div>
        
        {/* Close button for interstitial/preroll ads */}
        {(type === "interstitial" || type === "preroll") && showCloseButton && (
          <button 
            className="absolute top-2 right-2 bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-black/90"
            onClick={handleClose}
            aria-label="Close advertisement"
          >
            <X size={14} />
          </button>
        )}
        
        {/* "Advertisement" label for transparency */}
        <div className="absolute bottom-1 left-1 text-[10px] text-muted-foreground/70 flex items-center">
          <span>Ad</span>
          {ADSENSE_CONFIG.testMode && (
            <span className="ml-1 text-[8px] bg-yellow-500/20 text-yellow-600 px-1 rounded">
              TEST MODE
            </span>
          )}
        </div>
        
        {/* AdChoices - Required by Google Policy */}
        <div className="absolute bottom-1 right-1">
          <a 
            href="https://www.google.com/ads/preferences" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center text-[8px] text-muted-foreground/70 hover:text-muted-foreground"
          >
            <span className="mr-0.5">AdChoices</span>
            <ExternalLink size={8} />
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdDisplay;
