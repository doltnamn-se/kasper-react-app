
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Function to check screen size
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Initial check
    checkIsMobile()
    
    // Add event listener for resize
    window.addEventListener("resize", checkIsMobile)
    
    // Clean up
    return () => window.removeEventListener("resize", checkIsMobile)
  }, [])

  // Add console log to debug
  console.log("isMobile:", isMobile, "width:", window.innerWidth);
  
  return isMobile
}
