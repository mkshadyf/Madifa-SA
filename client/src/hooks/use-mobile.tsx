import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Set a mobile-first initial state based on navigator.maxTouchPoints
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
