import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';

// Define the accessibility settings interface
export interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  subtitlesEnabled: boolean;
  subtitleSize: 'small' | 'medium' | 'large';
  subtitleBackground: boolean;
  keyboardNavigationEnabled: boolean;
  autoplayVideos: boolean;
  textToSpeechEnabled: boolean;
  focusIndicatorsEnhanced: boolean;
}

// Define the context interface
interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (settings: Partial<AccessibilitySettings>) => void;
  resetSettings: () => void;
  showAccessibilityPanel: boolean;
  toggleAccessibilityPanel: () => void;
}

// Default settings
const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  subtitlesEnabled: true,
  subtitleSize: 'medium',
  subtitleBackground: true,
  keyboardNavigationEnabled: true,
  autoplayVideos: true,
  textToSpeechEnabled: false,
  focusIndicatorsEnhanced: false
};

// Create the context
const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

// Provider component
export const AccessibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Use localStorage to persist settings
  const [settings, setSettings] = useLocalStorage<AccessibilitySettings>(
    'madifa-accessibility-settings',
    defaultSettings
  );
  
  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false);
  
  // Update document with current accessibility settings
  useEffect(() => {
    // Apply high contrast
    if (settings.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    
    // Apply large text
    if (settings.largeText) {
      document.documentElement.classList.add('large-text');
    } else {
      document.documentElement.classList.remove('large-text');
    }
    
    // Apply reduced motion
    if (settings.reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
    
    // Apply enhanced focus indicators
    if (settings.focusIndicatorsEnhanced) {
      document.documentElement.classList.add('enhanced-focus');
    } else {
      document.documentElement.classList.remove('enhanced-focus');
    }
    
  }, [settings]);
  
  // Check for user's prefers-reduced-motion setting
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion && !settings.reducedMotion) {
      updateSettings({ reducedMotion: true });
    }
  }, []);
  
  // Update settings
  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings
    }));
  };
  
  // Reset settings to defaults
  const resetSettings = () => {
    setSettings(defaultSettings);
  };
  
  // Toggle accessibility panel
  const toggleAccessibilityPanel = () => {
    setShowAccessibilityPanel(prev => !prev);
  };
  
  // Context value
  const value = {
    settings,
    updateSettings,
    resetSettings,
    showAccessibilityPanel,
    toggleAccessibilityPanel
  };
  
  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

// Custom hook to use the accessibility context
export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  
  return context;
};