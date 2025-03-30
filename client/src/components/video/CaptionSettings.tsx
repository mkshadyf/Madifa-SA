import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CaptionStylePreferences, fontSizePresets, fontColorPresets, backgroundColorPresets } from '@/lib/captionSettings';
import { X, RefreshCw, Type, Palette } from 'lucide-react';

interface CaptionSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: CaptionStylePreferences;
  onUpdatePreferences: (preferences: Partial<CaptionStylePreferences>) => void;
  onResetPreferences: () => void;
}

export default function CaptionSettings({
  isOpen,
  onClose,
  preferences,
  onUpdatePreferences,
  onResetPreferences
}: CaptionSettingsProps) {
  const [activeTab, setActiveTab] = useState('text');
  
  // Preview text for the captions
  const previewText = "This is a preview of how your captions will look";
  
  // Helper to generate caption preview style
  const getPreviewStyle = (): React.CSSProperties => {
    return {
      fontSize: `${preferences.fontSize}px`,
      fontFamily: preferences.fontFamily,
      fontWeight: preferences.fontWeight,
      color: preferences.fontColor,
      backgroundColor: `${preferences.backgroundColor}${Math.round(preferences.backgroundOpacity * 255).toString(16).padStart(2, '0')}`,
      padding: '0.5em 1em',
      borderRadius: '4px',
      textShadow: preferences.textShadow ? '1px 1px 2px rgba(0, 0, 0, 0.8)' : 'none',
      letterSpacing: `${preferences.letterSpacing}px`,
      lineHeight: preferences.lineHeight,
      textAlign: 'center',
      margin: '1rem 0',
      maxWidth: '100%',
      boxSizing: 'border-box',
    };
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto" aria-describedby="caption-settings-description">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Caption Settings
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription id="caption-settings-description">
            Customize how captions appear on the video
          </DialogDescription>
        </DialogHeader>
        
        {/* Caption Preview */}
        <div className="bg-black rounded-md p-4 my-2 flex items-center justify-center">
          <div style={getPreviewStyle()}>
            {previewText}
          </div>
        </div>
        
        <Tabs defaultValue="text" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="text" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Text
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Appearance
            </TabsTrigger>
          </TabsList>
          
          {/* Text Settings */}
          <TabsContent value="text" className="space-y-4">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="fontSize">Font Size: {preferences.fontSize}px</Label>
                </div>
                <Select 
                  value={preferences.fontSize.toString()}
                  onValueChange={(value) => onUpdatePreferences({ fontSize: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a font size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Font Size</SelectLabel>
                      {fontSizePresets.map((preset) => (
                        <SelectItem key={preset.size} value={preset.size.toString()}>
                          {preset.name} ({preset.size}px)
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="fontFamily">Font Family</Label>
                </div>
                <Select 
                  value={preferences.fontFamily}
                  onValueChange={(value) => onUpdatePreferences({ fontFamily: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a font family" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Font Family</SelectLabel>
                      <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                      <SelectItem value="Helvetica, sans-serif">Helvetica</SelectItem>
                      <SelectItem value="Verdana, sans-serif">Verdana</SelectItem>
                      <SelectItem value="Georgia, serif">Georgia</SelectItem>
                      <SelectItem value="'Times New Roman', serif">Times New Roman</SelectItem>
                      <SelectItem value="monospace">Monospace</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2 py-2">
                <Switch 
                  id="fontWeight"
                  checked={preferences.fontWeight === 'bold'}
                  onCheckedChange={(checked) => onUpdatePreferences({ fontWeight: checked ? 'bold' : 'normal' })}
                />
                <Label htmlFor="fontWeight">Bold Text</Label>
              </div>
              
              <div className="flex items-center space-x-2 py-2">
                <Switch 
                  id="textShadow"
                  checked={preferences.textShadow}
                  onCheckedChange={(checked) => onUpdatePreferences({ textShadow: checked })}
                />
                <Label htmlFor="textShadow">Text Shadow</Label>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="letterSpacing">Letter Spacing</Label>
                  <span>{preferences.letterSpacing}px</span>
                </div>
                <Slider
                  id="letterSpacing"
                  min={-1}
                  max={5}
                  step={0.5}
                  value={[preferences.letterSpacing]}
                  onValueChange={([value]) => onUpdatePreferences({ letterSpacing: value })}
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="lineHeight">Line Height</Label>
                  <span>{preferences.lineHeight}</span>
                </div>
                <Slider
                  id="lineHeight"
                  min={1}
                  max={3}
                  step={0.1}
                  value={[preferences.lineHeight]}
                  onValueChange={([value]) => onUpdatePreferences({ lineHeight: value })}
                />
              </div>
            </div>
          </TabsContent>
          
          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fontColor" className="block mb-2">Font Color</Label>
                  <Select 
                    value={preferences.fontColor}
                    onValueChange={(value) => onUpdatePreferences({ fontColor: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Font Color</SelectLabel>
                        {fontColorPresets.map((preset) => (
                          <SelectItem key={preset.color} value={preset.color}>
                            <div className="flex items-center">
                              <div 
                                className="h-4 w-4 rounded-full mr-2" 
                                style={{ backgroundColor: preset.color }}
                              ></div>
                              {preset.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="backgroundColor" className="block mb-2">Background Color</Label>
                  <Select 
                    value={preferences.backgroundColor}
                    onValueChange={(value) => onUpdatePreferences({ backgroundColor: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Background Color</SelectLabel>
                        {backgroundColorPresets.map((preset) => (
                          <SelectItem key={preset.color} value={preset.color}>
                            <div className="flex items-center">
                              <div 
                                className="h-4 w-4 rounded-full mr-2" 
                                style={{ backgroundColor: preset.color }}
                              ></div>
                              {preset.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="backgroundOpacity">Background Opacity</Label>
                  <span>{Math.round(preferences.backgroundOpacity * 100)}%</span>
                </div>
                <Slider
                  id="backgroundOpacity"
                  min={0}
                  max={1}
                  step={0.05}
                  value={[preferences.backgroundOpacity]}
                  onValueChange={([value]) => onUpdatePreferences({ backgroundOpacity: value })}
                />
              </div>
              
              <div>
                <Label className="block mb-2">Position</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={preferences.position === 'top' ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => onUpdatePreferences({ position: 'top' })}
                  >
                    Top
                  </Button>
                  <Button
                    variant={preferences.position === 'bottom' ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => onUpdatePreferences({ position: 'bottom' })}
                  >
                    Bottom
                  </Button>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="verticalOffset">Distance from {preferences.position}</Label>
                  <span>{preferences.verticalOffset}%</span>
                </div>
                <Slider
                  id="verticalOffset"
                  min={0}
                  max={25}
                  step={1}
                  value={[preferences.verticalOffset]}
                  onValueChange={([value]) => onUpdatePreferences({ verticalOffset: value })}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button 
            variant="outline" 
            type="button" 
            onClick={onResetPreferences}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button type="button" onClick={onClose}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}