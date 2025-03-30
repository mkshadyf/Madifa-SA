import React, { useState, useEffect } from 'react';
import { Download, CheckCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { FeatureHighlight } from '@/components/ui/engagement-tooltip';
import { bounce } from '@/lib/animations';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    'beforeinstallprompt': BeforeInstallPromptEvent;
    'appinstalled': Event;
  }
}

interface InstallButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showTooltip?: boolean;
  label?: string;
}

const InstallButton: React.FC<InstallButtonProps> = ({
  variant = 'default',
  size = 'default',
  className = '',
  showTooltip = true,
  label = 'Install App'
}) => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if app is already installed
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
    
    // Check if it's iOS device
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);
    
    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Store the event so it can be triggered later
      setInstallPrompt(e);
    };
    
    // Listen for successful install
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      toast({
        title: "Successfully installed!",
        description: "The app has been installed on your device",
      });
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [toast]);
  
  const handleInstallClick = async () => {
    if (!installPrompt) return;
    
    try {
      // Show the install prompt
      await installPrompt.prompt();
      
      // Wait for user's choice
      const choiceResult = await installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        toast({
          title: "Installation started",
          description: "The app is being installed on your device",
        });
      } else {
        toast({
          title: "Installation canceled",
          description: "You can install the app later from the settings menu",
          variant: "destructive",
        });
      }
      
      // Reset the install prompt - it can only be used once
      setInstallPrompt(null);
    } catch (error) {
      console.error('Error installing PWA:', error);
      toast({
        title: "Installation failed",
        description: "There was an error installing the app. Please try again later.",
        variant: "destructive",
      });
    }
  };

  // If app is already installed or running in standalone mode
  if (isInstalled || isStandalone) {
    return null;
  }

  // iOS installation guide
  if (isIOS && !isStandalone) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size={size} 
              className={className}
              onClick={() => {
                toast({
                  title: "Install on iOS",
                  description: "Tap the Share button and then 'Add to Home Screen'",
                });
              }}
            >
              <Info className="mr-2 h-4 w-4" />
              Install Guide
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>To install on iOS: tap the Share button, then "Add to Home Screen"</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // If install prompt is available, show install button
  if (installPrompt) {
    if (showTooltip) {
      return (
        <FeatureHighlight
          featureId="pwa-install"
          title="Install as App"
          description="Install Madifa for a better viewing experience - no downloads required!"
          showInitially={true}
          placement="bottom"
          side="bottom"
        >
          <motion.div
            variants={bounce}
            initial="initial"
            animate="animate"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant={variant} 
              size={size} 
              className={className}
              onClick={handleInstallClick}
            >
              <Download className="mr-2 h-4 w-4" />
              {label}
            </Button>
          </motion.div>
        </FeatureHighlight>
      );
    }
    
    return (
      <Button 
        variant={variant} 
        size={size} 
        className={className}
        onClick={handleInstallClick}
      >
        <Download className="mr-2 h-4 w-4" />
        {label}
      </Button>
    );
  }

  // If the browser doesn't support installation, don't render anything
  return null;
};

export default InstallButton;