import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Subtitles, Settings, Check, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Track } from "@/hooks/useCaptions";
import { CaptionStylePreferences, fontSizePresets, fontColorPresets, backgroundColorPresets } from "@/lib/captionSettings";

interface CaptionTrackSelectorProps {
  tracks: Track[];
  selectedTrack: Track | null;
  onSelectTrack: (trackId: number | null) => void;
  showCaptions?: boolean;
  toggleCaptions?: () => void;
  stylePreferences?: CaptionStylePreferences;
  updateCaptionStyle?: (preferences: Partial<CaptionStylePreferences>) => void;
  resetCaptionStyles?: () => void;
}

const CaptionTrackSelector: React.FC<CaptionTrackSelectorProps> = ({
  tracks,
  selectedTrack,
  onSelectTrack,
  showCaptions = true,
  toggleCaptions = () => {},
  stylePreferences,
  updateCaptionStyle,
  resetCaptionStyles
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showStyleDialog, setShowStyleDialog] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  
  // Function to close the popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle style updates
  const handleFontSizeChange = (values: number[]) => {
    if (updateCaptionStyle) {
      updateCaptionStyle({ fontSize: values[0] });
    }
  };
  
  const handleOpacityChange = (values: number[]) => {
    if (updateCaptionStyle) {
      updateCaptionStyle({ fontOpacity: values[0] });
    }
  };
  
  const handleBackgroundOpacityChange = (values: number[]) => {
    if (updateCaptionStyle) {
      updateCaptionStyle({ backgroundOpacity: values[0] });
    }
  };
  
  const handlePositionChange = (position: 'top' | 'bottom') => {
    if (updateCaptionStyle) {
      updateCaptionStyle({ position });
    }
  };
  
  const handleVerticalOffsetChange = (values: number[]) => {
    if (updateCaptionStyle) {
      updateCaptionStyle({ verticalOffset: values[0] });
    }
  };
  
  const handleFontColorChange = (color: string) => {
    if (updateCaptionStyle) {
      updateCaptionStyle({ fontColor: color });
    }
  };
  
  const handleBackgroundColorChange = (color: string) => {
    if (updateCaptionStyle) {
      updateCaptionStyle({ backgroundColor: color });
    }
  };
  
  const handleTextShadowToggle = (checked: boolean) => {
    if (updateCaptionStyle) {
      updateCaptionStyle({ textShadow: checked });
    }
  };
  
  const handleFontWeightToggle = (checked: boolean) => {
    if (updateCaptionStyle) {
      updateCaptionStyle({ fontWeight: checked ? 'bold' : 'normal' });
    }
  };
  
  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/20"
            aria-label="Caption settings"
          >
            <Subtitles className="h-5 w-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          ref={popoverRef}
          className="w-64 p-0" 
          align="end" 
          sideOffset={5}
        >
          <div className="flex items-center justify-between p-3 border-b">
            <div className="flex items-center space-x-2">
              <Subtitles className="h-4 w-4" />
              <span className="font-medium">Captions</span>
            </div>
            <Switch 
              checked={showCaptions} 
              onCheckedChange={toggleCaptions}
              aria-label="Toggle captions"
            />
          </div>
          
          <div className="py-2">
            <div className="px-3 py-1 text-xs text-muted-foreground">
              CAPTION TRACKS
            </div>
            
            <div className="max-h-48 overflow-y-auto">
              {/* Option to turn off captions */}
              <button
                className="w-full flex items-center justify-between px-3 py-2 hover:bg-accent text-left"
                onClick={() => onSelectTrack(null)}
              >
                <span>Off</span>
                {selectedTrack === null && <Check className="h-4 w-4" />}
              </button>
              
              {/* List of caption tracks */}
              {tracks.map(track => (
                <button
                  key={track.id}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-accent text-left"
                  onClick={() => onSelectTrack(track.id)}
                >
                  <span>{track.label} ({track.language})</span>
                  {selectedTrack?.id === track.id && <Check className="h-4 w-4" />}
                </button>
              ))}
            </div>
            
            {/* Style settings button */}
            {stylePreferences && (
              <button
                className="w-full flex items-center justify-between px-3 py-2 hover:bg-accent text-left mt-2 border-t"
                onClick={() => {
                  setShowStyleDialog(true);
                  setIsOpen(false);
                }}
              >
                <div className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Caption Style</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Caption Style Dialog */}
      {stylePreferences && (
        <Dialog open={showStyleDialog} onOpenChange={setShowStyleDialog}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Caption Style</DialogTitle>
              <DialogDescription>
                Customize how captions appear when playing videos.
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="text">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="text">Text</TabsTrigger>
                <TabsTrigger value="background">Background</TabsTrigger>
                <TabsTrigger value="position">Position</TabsTrigger>
              </TabsList>
              
              {/* Text Tab */}
              <TabsContent value="text" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Font Size</Label>
                    <span className="text-sm text-muted-foreground">{stylePreferences.fontSize}px</span>
                  </div>
                  <Slider 
                    value={[stylePreferences.fontSize]} 
                    min={12} 
                    max={36} 
                    step={1} 
                    onValueChange={handleFontSizeChange}
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {fontSizePresets.map(preset => (
                      <button
                        key={preset.size}
                        className={`px-2 py-1 rounded text-xs ${
                          stylePreferences.fontSize === preset.size ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}
                        onClick={() => handleFontSizeChange([preset.size])}
                      >
                        {preset.size}px
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Font Color</Label>
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: stylePreferences.fontColor }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-8 gap-2">
                    {fontColorPresets.map((preset) => (
                      <button
                        key={preset.color}
                        className={`w-6 h-6 rounded-full border ${
                          stylePreferences.fontColor === preset.color ? 'ring-2 ring-primary ring-offset-2' : ''
                        }`}
                        style={{ backgroundColor: preset.color }}
                        onClick={() => handleFontColorChange(preset.color)}
                        aria-label={`Font color ${preset.name}`}
                      ></button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Font Opacity</Label>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(stylePreferences.fontOpacity * 100)}%
                    </span>
                  </div>
                  <Slider
                    value={[stylePreferences.fontOpacity]}
                    min={0.1}
                    max={1}
                    step={0.05}
                    onValueChange={handleOpacityChange}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="text-shadow">Text Shadow</Label>
                  <Switch
                    id="text-shadow"
                    checked={stylePreferences.textShadow}
                    onCheckedChange={handleTextShadowToggle}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="font-weight">Bold Text</Label>
                  <Switch
                    id="font-weight"
                    checked={stylePreferences.fontWeight === 'bold'}
                    onCheckedChange={handleFontWeightToggle}
                  />
                </div>
              </TabsContent>
              
              {/* Background Tab */}
              <TabsContent value="background" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Background Color</Label>
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: stylePreferences.backgroundColor }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-8 gap-2">
                    {backgroundColorPresets.map((preset) => (
                      <button
                        key={preset.color}
                        className={`w-6 h-6 rounded-full border ${
                          stylePreferences.backgroundColor === preset.color ? 'ring-2 ring-primary ring-offset-2' : ''
                        }`}
                        style={{ backgroundColor: preset.color }}
                        onClick={() => handleBackgroundColorChange(preset.color)}
                        aria-label={`Background color ${preset.name}`}
                      ></button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Background Opacity</Label>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(stylePreferences.backgroundOpacity * 100)}%
                    </span>
                  </div>
                  <Slider
                    value={[stylePreferences.backgroundOpacity]}
                    min={0}
                    max={1}
                    step={0.05}
                    onValueChange={handleBackgroundOpacityChange}
                  />
                </div>
              </TabsContent>
              
              {/* Position Tab */}
              <TabsContent value="position" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Position</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      className={`px-4 py-2 rounded flex items-center justify-center ${
                        stylePreferences.position === 'top' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}
                      onClick={() => handlePositionChange('top')}
                    >
                      Top
                    </button>
                    <button
                      className={`px-4 py-2 rounded flex items-center justify-center ${
                        stylePreferences.position === 'bottom' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}
                      onClick={() => handlePositionChange('bottom')}
                    >
                      Bottom
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Distance from Edge</Label>
                    <span className="text-sm text-muted-foreground">
                      {stylePreferences.verticalOffset}%
                    </span>
                  </div>
                  <Slider
                    value={[stylePreferences.verticalOffset]}
                    min={0}
                    max={20}
                    step={1}
                    onValueChange={handleVerticalOffsetChange}
                  />
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={resetCaptionStyles}>
                Reset to Default
              </Button>
              <Button onClick={() => setShowStyleDialog(false)}>
                Done
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default CaptionTrackSelector;