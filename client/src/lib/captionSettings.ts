import React from 'react';

export interface CaptionStylePreferences {
  // Text appearance
  fontSize: number; // in pixels
  fontFamily: string;
  fontWeight: 'normal' | 'bold';
  fontColor: string;
  fontOpacity: number; // 0-1
  
  // Background appearance
  backgroundColor: string;
  backgroundOpacity: number; // 0-1
  
  // Position
  position: 'top' | 'bottom';
  verticalOffset: number; // percentage from edge
  
  // Advanced options
  textShadow: boolean;
  letterSpacing: number;
  lineHeight: number;
}

// Default caption style preferences
export const defaultCaptionPreferences: CaptionStylePreferences = {
  fontSize: 18,
  fontFamily: 'Arial, sans-serif',
  fontWeight: 'normal',
  fontColor: '#FFFFFF', // White
  fontOpacity: 1,
  
  backgroundColor: '#000000', // Black
  backgroundOpacity: 0.5,
  
  position: 'bottom',
  verticalOffset: 10, // 10% from bottom
  
  textShadow: true,
  letterSpacing: 0,
  lineHeight: 1.2
};

// Save user caption preferences to localStorage
export function saveCaptionPreferences(preferences: Partial<CaptionStylePreferences>): void {
  try {
    const currentPrefs = getCaptionPreferences();
    const updatedPrefs = { ...currentPrefs, ...preferences };
    localStorage.setItem('caption-preferences', JSON.stringify(updatedPrefs));
  } catch (error) {
    console.error('Error saving caption preferences to localStorage:', error);
  }
}

// Get user caption preferences from localStorage or defaults
export function getCaptionPreferences(): CaptionStylePreferences {
  try {
    const savedPrefs = localStorage.getItem('caption-preferences');
    if (savedPrefs) {
      return { ...defaultCaptionPreferences, ...JSON.parse(savedPrefs) };
    }
  } catch (error) {
    console.error('Error loading caption preferences from localStorage:', error);
  }
  
  return defaultCaptionPreferences;
}

// Generate React CSS styles from preferences
export function generateCaptionStyles(preferences: CaptionStylePreferences): React.CSSProperties {
  return {
    color: preferences.fontColor,
    backgroundColor: preferences.backgroundColor 
      ? `rgba(${hexToRgb(preferences.backgroundColor)}, ${preferences.backgroundOpacity})`
      : 'transparent',
    fontSize: `${preferences.fontSize}px`,
    fontFamily: preferences.fontFamily,
    fontWeight: preferences.fontWeight,
    opacity: preferences.fontOpacity,
    textShadow: preferences.textShadow ? '1px 1px 2px rgba(0, 0, 0, 0.8)' : 'none',
    letterSpacing: `${preferences.letterSpacing}px`,
    lineHeight: preferences.lineHeight,
    padding: '0.25em 0.5em',
    borderRadius: '4px',
    maxWidth: '80%',
    margin: '0 auto',
    whiteSpace: 'pre-line',
    textAlign: 'center',
    display: 'inline-block'
  };
}

// Convert WebVTT settings for download/export
export function generateWebVTTSettings(preferences: CaptionStylePreferences): string {
  const rgbColor = hexToRgb(preferences.fontColor);
  const rgbBgColor = hexToRgb(preferences.backgroundColor);
  
  return `STYLE
::cue {
  color: rgba(${rgbColor}, ${preferences.fontOpacity});
  background-color: rgba(${rgbBgColor}, ${preferences.backgroundOpacity});
  font-family: ${preferences.fontFamily};
  font-size: ${preferences.fontSize}px;
  font-weight: ${preferences.fontWeight};
  text-shadow: ${preferences.textShadow ? '1px 1px 2px rgba(0, 0, 0, 0.8)' : 'none'};
  line-height: ${preferences.lineHeight};
  letter-spacing: ${preferences.letterSpacing}px;
}`;
}

// Helper function to convert hex color to RGB
function hexToRgb(hex: string): string {
  // Default to white if invalid hex
  if (!hex || !/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    return '255, 255, 255';
  }
  
  let r = 0, g = 0, b = 0;
  
  // 3 digits
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } 
  // 6 digits
  else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  
  return `${r}, ${g}, ${b}`;
}

// Preset font sizes for quick selection
export const fontSizePresets = [
  { name: 'Small', size: 14 },
  { name: 'Medium', size: 18 },
  { name: 'Large', size: 22 },
  { name: 'Extra Large', size: 26 },
  { name: 'Huge', size: 32 }
];

// Preset colors for text and background color selection
export const fontColorPresets = [
  { name: 'White', color: '#FFFFFF' },
  { name: 'Yellow', color: '#FFFF00' },
  { name: 'Green', color: '#00FF00' },
  { name: 'Cyan', color: '#00FFFF' },
  { name: 'Magenta', color: '#FF00FF' },
  { name: 'Red', color: '#FF0000' },
  { name: 'Blue', color: '#0000FF' },
  { name: 'Orange', color: '#FFA500' }
];

export const backgroundColorPresets = [
  { name: 'Black', color: '#000000' },
  { name: 'Dark Gray', color: '#333333' },
  { name: 'Gray', color: '#555555' },
  { name: 'Dark Blue', color: '#0000AA' },
  { name: 'Dark Red', color: '#AA0000' },
  { name: 'Dark Green', color: '#00AA00' },
  { name: 'Dark Purple', color: '#AA00AA' },
  { name: 'Transparent', color: 'transparent' }
];