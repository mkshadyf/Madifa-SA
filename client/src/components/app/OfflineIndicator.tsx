import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { 
  Alert,
  AlertDescription,
  AlertTitle
} from '@/components/ui/alert';

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Initial check
    setIsOffline(!navigator.onLine);

    // Event listeners for online/offline events
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) {
    return null;
  }

  return (
    <Alert 
      variant="destructive" 
      className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80 shadow-lg"
    >
      <WifiOff className="h-4 w-4" />
      <AlertTitle>You're offline</AlertTitle>
      <AlertDescription>
        You can still browse previously viewed content, but some features may be limited.
      </AlertDescription>
    </Alert>
  );
}