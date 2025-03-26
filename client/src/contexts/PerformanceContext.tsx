import React, { createContext, useContext, ReactNode } from 'react';
import { usePerformance } from '@/hooks/use-performance';

type PerformanceContextType = {
  lightweight: boolean;
  toggleLightweightMode: (enabled?: boolean) => void;
  quality: 'low' | 'medium' | 'high';
  videoQuality: '360p' | '480p' | '720p' | '1080p';
  batchSize: number;
  optimizeImageUrl: (url: string, width?: number) => string;
  deviceStatus: {
    isLowEndDevice: boolean;
    isSlowConnection: boolean;
    quality: 'low' | 'medium' | 'high';
    videoQuality: '360p' | '480p' | '720p' | '1080p';
    batchSize: number;
    lightweight: boolean;
  };
};

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

export const usePerformanceContext = () => {
  const context = useContext(PerformanceContext);
  if (context === undefined) {
    throw new Error('usePerformanceContext must be used within a PerformanceProvider');
  }
  return context;
};

export const PerformanceProvider = ({ children }: { children: ReactNode }) => {
  const performanceTools = usePerformance();
  
  return (
    <PerformanceContext.Provider value={performanceTools}>
      {children}
    </PerformanceContext.Provider>
  );
};