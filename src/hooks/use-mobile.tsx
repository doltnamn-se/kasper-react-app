import * as React from "react"

const MOBILE_BREAKPOINT = 768

// Check if device is actually a mobile device (not just narrow screen)
const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // Check for mobile device indicators
  const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
  
  // Check for touch support
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  return isMobileUA || (hasTouch && window.innerWidth < 1024);
};

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // First check if it's a mobile device
    const isActualMobileDevice = isMobileDevice();
    
    if (isActualMobileDevice) {
      // If it's a mobile device, always return true regardless of orientation
      setIsMobile(true);
    } else {
      // If it's not a mobile device, use screen width as before
      const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
      const onChange = () => {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
      }
      mql.addEventListener("change", onChange)
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
      return () => mql.removeEventListener("change", onChange)
    }
  }, [])

  return !!isMobile
}
