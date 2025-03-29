/**
 * This file contains viewport-related utility functions to fix common mobile viewport issues 
 * such as 100vh not accounting for browser UI and safe areas.
 */

/**
 * Sets CSS variables for viewport height and updates them on resize
 * This is to address iOS Safari and other mobile browsers where
 * 100vh includes the address bar height
 * 
 * @returns Cleanup function to remove event listeners
 */
export function setAppHeight(): () => void {
  // Function to update CSS custom property based on window inner height
  const setHeight = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };
  
  // Initial call to set height
  setHeight();
  
  // Add event listeners
  window.addEventListener('resize', setHeight);
  window.addEventListener('orientationchange', setHeight);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('resize', setHeight);
    window.removeEventListener('orientationchange', setHeight);
  };
}

/**
 * Handles viewport-specific operations for iOS safe areas
 * This is especially important for iOS devices with notches/dynamic islands
 * and for bottom navigation bars
 */
export function enableSafeAreas(): void {
  // Add viewport-fit=cover meta if needed
  const existingMeta = document.querySelector('meta[name="viewport"]');
  if (existingMeta) {
    const content = existingMeta.getAttribute('content') || '';
    if (!content.includes('viewport-fit=cover')) {
      existingMeta.setAttribute('content', `${content}, viewport-fit=cover`);
    }
  }
}