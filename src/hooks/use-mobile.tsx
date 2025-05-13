
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)
  const [initialized, setInitialized] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Initial check function
    const checkIsMobile = () => {
      const width = window.innerWidth;
      const mobileStatus = width < MOBILE_BREAKPOINT;
      setIsMobile(mobileStatus);
      if (!initialized) {
        setInitialized(true);
      }
      console.log(`useIsMobile: width=${width}, isMobile=${mobileStatus}`);
    }
    
    // Initial check (run immediately)
    checkIsMobile();
    
    // Set up resize listener
    window.addEventListener("resize", checkIsMobile);
    
    // Clean up
    return () => window.removeEventListener("resize", checkIsMobile);
  }, [initialized]);
  
  // Ensure we always have a value, defaulting to false for SSR
  return typeof window !== 'undefined' ? isMobile : false;
}
