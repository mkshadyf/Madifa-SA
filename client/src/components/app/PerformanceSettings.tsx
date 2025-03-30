import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { usePerformanceContext } from '@/contexts/PerformanceContext';
import { BatteryMedium, Gauge, Wifi, Cog, Zap } from 'lucide-react';

interface PerformanceSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const PerformanceSettings: React.FC<PerformanceSettingsProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const { 
    lightweight, 
    toggleLightweightMode,
    deviceStatus
  } = usePerformanceContext();
  
  const [automaticMode, setAutomaticMode] = useState(true);
  
  const handleToggleAutomatic = (checked: boolean) => {
    setAutomaticMode(checked);
    if (checked) {
      // If automatic is enabled, reset to automatic detection
      toggleLightweightMode(deviceStatus.isLowEndDevice || deviceStatus.isSlowConnection);
    }
  };
  
  const handleToggleLightweight = (checked: boolean) => {
    // Only manually set if not in automatic mode
    if (!automaticMode) {
      toggleLightweightMode(checked);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]" aria-describedby="performance-settings-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Performance Settings
          </DialogTitle>
          <DialogDescription id="performance-settings-description">
            Optimize your viewing experience based on your device and network
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          {/* Device Status */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium leading-none">Device Status</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Cog className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Device:</span>
                <span className={deviceStatus.isLowEndDevice ? "text-amber-500" : "text-green-500"}>
                  {deviceStatus.isLowEndDevice ? "Low-end" : "High-end"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Network:</span>
                <span className={deviceStatus.isSlowConnection ? "text-amber-500" : "text-green-500"}>
                  {deviceStatus.isSlowConnection ? "Slow" : "Fast"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Quality:</span>
                <span>
                  {deviceStatus.quality === 'low' ? "Low" : 
                   deviceStatus.quality === 'medium' ? "Medium" : "High"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <BatteryMedium className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Mode:</span>
                <span>
                  {lightweight ? "Power Saving" : "Performance"}
                </span>
              </div>
            </div>
          </div>
          
          {/* Performance Controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="automatic">Automatic Optimization</Label>
                <p className="text-[0.8rem] text-muted-foreground">
                  Automatically adjust based on your device
                </p>
              </div>
              <Switch
                id="automatic"
                checked={automaticMode}
                onCheckedChange={handleToggleAutomatic}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label 
                  htmlFor="lightweight"
                  className={automaticMode ? "text-muted-foreground" : ""}
                >
                  Lightweight Mode
                </Label>
                <p className="text-[0.8rem] text-muted-foreground">
                  Reduces animations and image quality
                </p>
              </div>
              <Switch
                id="lightweight"
                disabled={automaticMode}
                checked={lightweight}
                onCheckedChange={handleToggleLightweight}
              />
            </div>
          </div>
          
          {/* Performance Tips */}
          <div className="rounded-md bg-muted p-3 text-sm">
            <h4 className="font-medium mb-1">Performance Tips:</h4>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground text-xs">
              <li>Lightweight mode reduces animations and image quality</li>
              <li>Video quality will adjust automatically based on your network</li>
              <li>Downloaded content plays at the highest quality offline</li>
            </ul>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            onClick={onClose}
            variant="outline"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PerformanceSettings;