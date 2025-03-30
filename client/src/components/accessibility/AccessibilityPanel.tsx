import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Type, Eye, Volume2, Keyboard, Monitor, Moon, PlayCircle, RefreshCw } from 'lucide-react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { simpleFade, slideInRight } from '@/lib/animations';

interface AccessibilityPanelProps {
  className?: string;
}

const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({ className }) => {
  const { 
    settings, 
    updateSettings, 
    resetSettings,
    showAccessibilityPanel,
    toggleAccessibilityPanel
  } = useAccessibility();
  
  const panelRef = useRef<HTMLDivElement>(null);
  
  // Handle click outside to close panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        if (showAccessibilityPanel) {
          toggleAccessibilityPanel();
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAccessibilityPanel, toggleAccessibilityPanel]);
  
  // Handle escape key to close panel
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showAccessibilityPanel) {
        toggleAccessibilityPanel();
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showAccessibilityPanel, toggleAccessibilityPanel]);

  return (
    <Sheet open={showAccessibilityPanel} onOpenChange={toggleAccessibilityPanel}>
      <SheetContent 
        side="right" 
        className="w-full max-w-md overflow-y-auto"
        forceMount
      >
        <motion.div
          ref={panelRef}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={simpleFade}
          className={`h-full flex flex-col ${className}`}
        >
          <SheetHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-bold">Accessibility Settings</SheetTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleAccessibilityPanel}
                aria-label="Close accessibility panel"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </SheetHeader>
          
          <Tabs defaultValue="display" className="flex-1 py-4">
            <TabsList className="w-full grid grid-cols-3 mb-4">
              <TabsTrigger value="display" className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                <span>Display</span>
              </TabsTrigger>
              <TabsTrigger value="media" className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                <span>Media</span>
              </TabsTrigger>
              <TabsTrigger value="navigation" className="flex items-center gap-2">
                <Keyboard className="h-4 w-4" />
                <span>Navigation</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="display" className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">High Contrast</Label>
                    <p className="text-sm text-muted-foreground">
                      Increase contrast for better visibility
                    </p>
                  </div>
                  <Switch 
                    checked={settings.highContrast}
                    onCheckedChange={(checked) => updateSettings({ highContrast: checked })}
                  />
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">Large Text</Label>
                    <p className="text-sm text-muted-foreground">
                      Increase text size for better readability
                    </p>
                  </div>
                  <Switch 
                    checked={settings.largeText}
                    onCheckedChange={(checked) => updateSettings({ largeText: checked })}
                  />
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">Reduced Motion</Label>
                    <p className="text-sm text-muted-foreground">
                      Minimize animations and transitions
                    </p>
                  </div>
                  <Switch 
                    checked={settings.reducedMotion}
                    onCheckedChange={(checked) => updateSettings({ reducedMotion: checked })}
                  />
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">Enhanced Focus Indicators</Label>
                    <p className="text-sm text-muted-foreground">
                      Make focus outlines more visible
                    </p>
                  </div>
                  <Switch 
                    checked={settings.focusIndicatorsEnhanced}
                    onCheckedChange={(checked) => updateSettings({ focusIndicatorsEnhanced: checked })}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="media" className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">Enable Subtitles</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically show subtitles when available
                    </p>
                  </div>
                  <Switch 
                    checked={settings.subtitlesEnabled}
                    onCheckedChange={(checked) => updateSettings({ subtitlesEnabled: checked })}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label className="text-base font-medium">Subtitle Size</Label>
                  <RadioGroup 
                    value={settings.subtitleSize}
                    onValueChange={(value) => updateSettings({ 
                      subtitleSize: value as 'small' | 'medium' | 'large' 
                    })}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="small" id="subtitle-small" />
                      <Label htmlFor="subtitle-small">Small</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="subtitle-medium" />
                      <Label htmlFor="subtitle-medium">Medium</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="large" id="subtitle-large" />
                      <Label htmlFor="subtitle-large">Large</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">Subtitle Background</Label>
                    <p className="text-sm text-muted-foreground">
                      Add background behind subtitles for better readability
                    </p>
                  </div>
                  <Switch 
                    checked={settings.subtitleBackground}
                    onCheckedChange={(checked) => updateSettings({ subtitleBackground: checked })}
                  />
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">Autoplay Videos</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically play videos when loaded
                    </p>
                  </div>
                  <Switch 
                    checked={settings.autoplayVideos}
                    onCheckedChange={(checked) => updateSettings({ autoplayVideos: checked })}
                  />
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">Text to Speech</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable screen reader compatibility enhancements
                    </p>
                  </div>
                  <Switch 
                    checked={settings.textToSpeechEnabled}
                    onCheckedChange={(checked) => updateSettings({ textToSpeechEnabled: checked })}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="navigation" className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">Keyboard Navigation</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable enhanced keyboard navigation
                    </p>
                  </div>
                  <Switch 
                    checked={settings.keyboardNavigationEnabled}
                    onCheckedChange={(checked) => updateSettings({ keyboardNavigationEnabled: checked })}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="border-t pt-4 mt-auto">
            <Button 
              variant="outline" 
              onClick={resetSettings} 
              className="w-full flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reset to Default Settings
            </Button>
          </div>
        </motion.div>
      </SheetContent>
    </Sheet>
  );
};

export default AccessibilityPanel;