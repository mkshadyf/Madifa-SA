/**
 * Performance optimization utilities for mobile devices
 */

// Check if device is low-end (low memory or CPU)
export function isLowEndDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  
  // Check for device memory API
  const memory = (navigator as any).deviceMemory;
  if (memory && memory < 4) {
    return true;
  }
  
  // Check for hardware concurrency (CPU cores)
  const cores = navigator.hardwareConcurrency;
  if (cores && cores <= 4) {
    return true;
  }
  
  // User agent detection for low-end devices
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('android') && !ua.includes('chrome')) {
    return true;
  }
  
  return false;
}

// Check if the connection is slow
export function isSlowConnection(): boolean {
  if (typeof navigator === 'undefined') return false;
  
  const connection = (navigator as any).connection;
  if (!connection) return false;
  
  // Check effective connection type
  if (connection.effectiveType && ['slow-2g', '2g', '3g'].includes(connection.effectiveType)) {
    return true;
  }
  
  // Check downlink speed (< 1Mbps is considered slow)
  if (connection.downlink && connection.downlink < 1) {
    return true;
  }
  
  return false;
}

// Return quality settings based on device capabilities
export function getOptimalQuality(): 'low' | 'medium' | 'high' {
  const isLowEnd = isLowEndDevice();
  const isSlow = isSlowConnection();
  
  if (isLowEnd && isSlow) {
    return 'low';
  } else if (isLowEnd || isSlow) {
    return 'medium';
  } else {
    return 'high';
  }
}

// Get appropriately sized image URL based on device capabilities
export function getOptimizedImageUrl(url: string, width?: number): string {
  if (!url) return url;
  
  // If URL is already optimized or using a CDN that supports dynamic sizing, return as is
  if (url.includes('w=') || url.includes('width=')) {
    return url;
  }
  
  const quality = getOptimalQuality();
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
  
  // Determine optimal width based on quality settings and screen size
  let optimalWidth = width || screenWidth;
  
  if (quality === 'low') {
    optimalWidth = Math.min(480, optimalWidth);
  } else if (quality === 'medium') {
    optimalWidth = Math.min(768, optimalWidth);
  }
  
  // For Supabase storage URLs, add width transformation
  if (url.includes('supabase.co/storage/v1')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}width=${optimalWidth}&quality=${quality === 'low' ? 70 : quality === 'medium' ? 80 : 90}`;
  }
  
  return url;
}

// Debounce function to limit expensive operations
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function to limit execution rate
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return function(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// Check if prefers-reduced-motion is enabled
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Enable lightweight mode to reduce animations and effects
let lightweightMode = false;

export function isLightweightMode(): boolean {
  return lightweightMode || isLowEndDevice() || isSlowConnection() || prefersReducedMotion();
}

export function setLightweightMode(enabled: boolean): void {
  lightweightMode = enabled;
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('lightweight-mode', lightweightMode);
  }
}

// Get optimal video quality based on device and connection
export function getOptimalVideoQuality(): '360p' | '480p' | '720p' | '1080p' {
  const quality = getOptimalQuality();
  
  switch (quality) {
    case 'low':
      return '360p';
    case 'medium':
      return '480p';
    case 'high':
      return '720p';
    default:
      return '720p';
  }
}

// Calculate how many items to show in carousels based on device capability
export function getOptimalBatchSize(): number {
  const quality = getOptimalQuality();
  
  switch (quality) {
    case 'low':
      return 5;
    case 'medium':
      return 10;
    case 'high':
      return 20;
    default:
      return 10;
  }
}

// Check if device is in battery saving mode
export function isBatterySavingMode(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !('getBattery' in navigator)) {
    return Promise.resolve(false);
  }
  
  return (navigator as any).getBattery().then((battery: any) => {
    // Consider battery saving if discharging and below 20%
    return !battery.charging && battery.level < 0.2;
  }).catch(() => false);
}

// Initialize performance monitoring
export function initPerformanceMonitoring(): void {
  if (typeof window === 'undefined') return;
  
  // Set lightweight mode if necessary
  const shouldUseLightweight = isLowEndDevice() || isSlowConnection() || prefersReducedMotion();
  setLightweightMode(shouldUseLightweight);
  
  // Listen for connection changes
  const connection = (navigator as any).connection;
  if (connection) {
    connection.addEventListener('change', () => {
      setLightweightMode(isLowEndDevice() || isSlowConnection() || prefersReducedMotion());
    });
  }
  
  // Listen for battery status changes
  if ('getBattery' in navigator) {
    (navigator as any).getBattery().then((battery: any) => {
      const updateBatterySavingMode = () => {
        if (!battery.charging && battery.level < 0.2) {
          setLightweightMode(true);
        }
      };
      
      battery.addEventListener('levelchange', updateBatterySavingMode);
      battery.addEventListener('chargingchange', updateBatterySavingMode);
    });
  }
}