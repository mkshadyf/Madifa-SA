import * as React from "react"

const MOBILE_BREAKPOINT = 768
const SMALL_BREAKPOINT = 640
const EXTRA_SMALL_BREAKPOINT = 480

export type ScreenSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export function useIsMobile() {
  // Set a mobile-first initial state based on window width
  const initialState = typeof window !== 'undefined' ? 
    window.innerWidth < MOBILE_BREAKPOINT : 
    false;
    
  const [isMobile, setIsMobile] = React.useState<boolean>(initialState)

  React.useEffect(() => {
    // Define handler to properly update state based on screen size
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Check immediately for initial render
    handleResize()
    
    // Add both matchMedia listener and resize listener for better support
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(mql.matches)
    }
    
    // Add both listeners for maximum compatibility
    window.addEventListener('resize', handleResize)
    mql.addEventListener("change", onChange)
    
    // Clean up event listeners
    return () => {
      window.removeEventListener('resize', handleResize)
      mql.removeEventListener("change", onChange)
    }
  }, [])

  return isMobile
}

export function useScreenSize() {
  // Set a mobile-first initial state
  const getInitialScreenSize = (): ScreenSize => {
    if (typeof window === 'undefined') return 'md';
    
    const width = window.innerWidth;
    if (width < EXTRA_SMALL_BREAKPOINT) return 'xs';
    if (width < SMALL_BREAKPOINT) return 'sm';
    if (width < MOBILE_BREAKPOINT) return 'md';
    if (width < 1024) return 'lg';
    return 'xl';
  };
  
  const [screenSize, setScreenSize] = React.useState<ScreenSize>(getInitialScreenSize());
  
  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      
      if (width < EXTRA_SMALL_BREAKPOINT) {
        setScreenSize('xs');
      } else if (width < SMALL_BREAKPOINT) {
        setScreenSize('sm');
      } else if (width < MOBILE_BREAKPOINT) {
        setScreenSize('md');
      } else if (width < 1024) {
        setScreenSize('lg');
      } else {
        setScreenSize('xl');
      }
    };
    
    // Check on initial render
    handleResize();
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return screenSize;
}
