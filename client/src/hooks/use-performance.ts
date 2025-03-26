import { useState, useEffect, useCallback } from 'react';
import { 
  isLightweightMode, 
  setLightweightMode, 
  getOptimalQuality,
  isLowEndDevice,
  isSlowConnection,
  getOptimalVideoQuality,
  getOptimalBatchSize,
  initPerformanceMonitoring
} from '@/lib/performanceOptimizer';

export function usePerformance() {
  const [lightweight, setLightweight] = useState(isLightweightMode());
  const [quality, setQuality] = useState(getOptimalQuality());
  const [videoQuality, setVideoQuality] = useState(getOptimalVideoQuality());
  const [batchSize, setBatchSize] = useState(getOptimalBatchSize());
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize performance monitoring
  useEffect(() => {
    if (!isInitialized) {
      initPerformanceMonitoring();
      setIsInitialized(true);
    }
    
    // Update state based on current device/network capabilities
    const updatePerformanceSettings = () => {
      const newQuality = getOptimalQuality();
      setQuality(newQuality);
      setVideoQuality(getOptimalVideoQuality());
      setBatchSize(getOptimalBatchSize());
      setLightweight(isLightweightMode());
    };
    
    // Set up listeners to update performance settings when conditions change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updatePerformanceSettings();
      }
    };
    
    const handleOnlineChange = () => {
      updatePerformanceSettings();
    };
    
    window.addEventListener('resize', updatePerformanceSettings);
    window.addEventListener('online', handleOnlineChange);
    window.addEventListener('offline', handleOnlineChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Setup connection listeners if available
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updatePerformanceSettings);
    }
    
    return () => {
      window.removeEventListener('resize', updatePerformanceSettings);
      window.removeEventListener('online', handleOnlineChange);
      window.removeEventListener('offline', handleOnlineChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (connection) {
        connection.removeEventListener('change', updatePerformanceSettings);
      }
    };
  }, [isInitialized]);
  
  // Toggle lightweight mode manually
  const toggleLightweightMode = useCallback((enabled?: boolean) => {
    const newValue = enabled !== undefined ? enabled : !lightweight;
    setLightweightMode(newValue);
    setLightweight(newValue);
  }, [lightweight]);
  
  // Get device and connection status
  const deviceStatus = {
    isLowEndDevice: isLowEndDevice(),
    isSlowConnection: isSlowConnection(),
    quality,
    videoQuality,
    batchSize,
    lightweight
  };
  
  // Optimize image URL based on current quality settings
  const optimizeImageUrl = useCallback((url: string, width?: number) => {
    if (!url) return '';
    
    // For Supabase storage URLs, add width transformation
    if (url.includes('supabase.co/storage/v1')) {
      const separator = url.includes('?') ? '&' : '?';
      const imageQuality = quality === 'low' ? 70 : quality === 'medium' ? 80 : 90;
      const imageWidth = width || (quality === 'low' ? 480 : quality === 'medium' ? 768 : 1280);
      
      return `${url}${separator}width=${imageWidth}&quality=${imageQuality}`;
    }
    
    return url;
  }, [quality]);
  
  return {
    deviceStatus,
    lightweight,
    toggleLightweightMode,
    quality,
    videoQuality,
    batchSize,
    optimizeImageUrl
  };
}