import { useEffect, useRef } from 'react';
import { ADSENSE_CONFIG } from '../../lib/adConfig';

export type GoogleAdType = 'anywhere' | 'multiplex';

interface AdSenseProps {
  type: GoogleAdType;
  className?: string;
}

// Using environment variables via adConfig

const AdSense = ({ type, className = '' }: AdSenseProps) => {
  const adRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Add AdSense script if it doesn't exist
    const existingScript = document.querySelector('script[src*="adsbygoogle"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CONFIG.publisherId}`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }
    
    // Initialize ad when component mounts
    try {
      if (adRef.current && typeof window !== 'undefined' && (window as any).adsbygoogle) {
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        (window as any).adsbygoogle.push({});
      }
    } catch (error) {
      console.error('Error initializing AdSense:', error);
    }
  }, []);
  
  if (type === 'anywhere') {
    return (
      <div className={className}>
        <ins
          ref={adRef as any}
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={ADSENSE_CONFIG.publisherId}
          data-ad-slot={ADSENSE_CONFIG.slots.anywhere.id}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }
  
  if (type === 'multiplex') {
    return (
      <div className={className}>
        <ins
          ref={adRef as any}
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-format="autorelaxed"
          data-ad-client={ADSENSE_CONFIG.publisherId}
          data-ad-slot={ADSENSE_CONFIG.slots.multiplex.id}
        />
      </div>
    );
  }
  
  return null;
};

export default AdSense;