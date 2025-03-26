import { useState, useEffect } from 'react';
import { 
  BeforeInstallPromptEvent, 
  listenForInstallPrompt, 
  isAppInstalled 
} from '@/lib/serviceWorkerRegistration';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

export function InstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [installed, setInstalled] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Listen for install prompt event
  useEffect(() => {
    // Check if already installed
    if (isAppInstalled()) {
      setInstalled(true);
      return;
    }

    // Listen for install prompt
    listenForInstallPrompt((e) => {
      setInstallPrompt(e);
      
      // On mobile, show the prompt automatically after 10 seconds
      // if user hasn't interacted with it before
      if (isMobile && !localStorage.getItem('pwa-prompt-dismissed')) {
        setTimeout(() => {
          setShowPrompt(true);
        }, 10000);
      }
    });

    // Listen for app installation
    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      toast({
        title: "App installed",
        description: "Madifa has been successfully installed on your device.",
      });
    });

    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!navigator.serviceWorker.controller) return;
        setShowUpdatePrompt(true);
      });
    }
  }, [isMobile, toast]);

  // Handle install button click
  const handleInstallClick = async () => {
    if (!installPrompt) return;
    
    // Show the install prompt
    await installPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const choiceResult = await installPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      toast({
        title: "Installing app",
        description: "Madifa is being installed on your device.",
      });
    } else {
      toast({
        title: "Installation declined",
        description: "You can install the app later from the menu.",
      });
      // Remember that user dismissed the prompt
      localStorage.setItem('pwa-prompt-dismissed', 'true');
    }
    
    // Clear the saved prompt since it can't be used twice
    setInstallPrompt(null);
    setShowPrompt(false);
  };

  // Handle update confirmation
  const handleUpdate = () => {
    setShowUpdatePrompt(false);
    window.location.reload();
  };

  // Handle prompt dismissal
  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember that user dismissed the prompt
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  return (
    <>
      {/* Install Prompt Dialog */}
      <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Install Madifa App</DialogTitle>
            <DialogDescription>
              Install Madifa on your device for a better experience. You'll get faster access, offline viewing, and more.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 py-4">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-800 to-purple-600 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">M</span>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold">Madifa</h4>
              <p className="text-sm text-muted-foreground">
                South African Original Content Platform
              </p>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
            <Button variant="outline" onClick={handleDismiss}>
              Not now
            </Button>
            <Button onClick={handleInstallClick}>
              Install App
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Alert Dialog */}
      <AlertDialog open={showUpdatePrompt} onOpenChange={setShowUpdatePrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Available</AlertDialogTitle>
            <AlertDialogDescription>
              A new version of Madifa is available. Reload the app to get the latest features and improvements.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Later</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdate}>
              Update Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Render an install button if needed */}
      {!installed && installPrompt && (
        <Button
          variant="outline"
          size="sm"
          className="hidden md:flex"
          onClick={() => setShowPrompt(true)}
        >
          Install App
        </Button>
      )}
    </>
  );
}