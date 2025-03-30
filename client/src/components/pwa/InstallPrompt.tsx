import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { usePwaInstall } from '@/hooks/usePwaInstall';
import { X, Download, Smartphone } from 'lucide-react';

export const InstallPrompt = () => {
  const { isInstallable, isInstalled, installApp } = usePwaInstall();
  const [dismissed, setDismissed] = useState(false);

  // Don't show if not installable, already installed, or dismissed
  if (!isInstallable || isInstalled || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-96 bg-background border border-border rounded-lg shadow-lg z-50 p-4 animate-in fade-in slide-in-from-bottom">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          <Smartphone className="h-5 w-5 text-primary mr-2" />
          <h3 className="font-semibold text-foreground">Install Madifa App</h3>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8" 
          onClick={() => setDismissed(true)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <p className="text-sm text-muted-foreground mb-3">
        Install Madifa on your device for easier access and offline viewing of downloaded content.
      </p>
      
      <div className="flex justify-between gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full" 
          onClick={() => setDismissed(true)}
        >
          Not now
        </Button>
        <Button 
          variant="default" 
          size="sm" 
          className="w-full" 
          onClick={installApp}
        >
          <Download className="h-4 w-4 mr-2" />
          Install App
        </Button>
      </div>
    </div>
  );
};