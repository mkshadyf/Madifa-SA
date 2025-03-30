import { useEffect, useRef } from 'react';

export type GoogleAdType = 'anywhere' | 'multiplex';

interface AdSenseProps {
  type: GoogleAdType;
  className?: string;
}

const PUBLISHER_ID = 'ca-pub-1318445400953510';

const AD_SLOTS = {
  anywhere: '3300782881',
  multiplex: '1987701211'
};

const AdSense = ({ type, className = '' }: AdSenseProps) => {
  const adRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Add AdSense script if it doesn't exist
    const existingScript = document.querySelector('script[src*="adsbygoogle"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${PUBLISHER_ID}`;
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
          data-ad-client={PUBLISHER_ID}
          data-ad-slot={AD_SLOTS.anywhere}
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
          data-ad-client={PUBLISHER_ID}
          data-ad-slot={AD_SLOTS.multiplex}
        />
      </div>
    );
  }
  
  return null;
};

export default AdSense;