/**
 * Mobile browsers (iOS Safari especially) have issues with viewport heights.
 * This function sets a CSS variable that can be used instead of 100vh.
 */
export function setAppHeight() {
  const doc = document.documentElement;
  const appHeight = () => {
    doc.style.setProperty('--app-height', `${window.innerHeight}px`);
  };
  
  window.addEventListener('resize', appHeight);
  window.addEventListener('orientationchange', appHeight);
  
  // Initial call
  appHeight();
  
  // Return cleanup function
  return () => {
    window.removeEventListener('resize', appHeight);
    window.removeEventListener('orientationchange', appHeight);
  };
}

/**
 * Check if the device has a notch (iPhone X and newer)
 */
export function hasNotch(): boolean {
  // iOS detection
  const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  
  if (!iOS) return false;
  
  // Check for devices that might have a notch
  const ratio = window.devicePixelRatio || 1;
  const screen = {
    width: window.screen.width * ratio,
    height: window.screen.height * ratio
  };
  
  // iPhone X, XS, 11 Pro: 1125 x 2436
  // iPhone XR, 11: 828 x 1792
  // iPhone XS Max, 11 Pro Max: 1242 x 2688
  // iPhone 12, 13 mini: 1080 x 2340
  // iPhone 12, 13, 12 Pro, 13 Pro: 1170 x 2532
  // iPhone 12 Pro Max, 13 Pro Max: 1284 x 2778
  // iPhone 14: 1170 x 2532
  // iPhone 14 Pro: 1179 x 2556
  // iPhone 14 Plus: 1284 x 2778
  // iPhone 14 Pro Max: 1290 x 2796
  
  return (
    // X, XS, 11 Pro
    (screen.width === 1125 && screen.height === 2436) ||
    // XR, 11
    (screen.width === 828 && screen.height === 1792) ||
    // XS Max, 11 Pro Max
    (screen.width === 1242 && screen.height === 2688) ||
    // 12, 13 mini
    (screen.width === 1080 && screen.height === 2340) ||
    // 12, 13, 12 Pro, 13 Pro
    (screen.width === 1170 && screen.height === 2532) ||
    // 12 Pro Max, 13 Pro Max, 14 Plus
    (screen.width === 1284 && screen.height === 2778) ||
    // 14 Pro
    (screen.width === 1179 && screen.height === 2556) ||
    // 14 Pro Max
    (screen.width === 1290 && screen.height === 2796) ||
    // For future devices - general check for newer iPhone aspect ratios
    (iOS && (screen.height / screen.width) > 2)
  );
}