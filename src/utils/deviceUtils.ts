
export const getWebDeviceType = (): 'desktop' | 'mobile' | 'tablet' => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') return 'desktop';

  // Get user agent
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Check for mobile-specific strings in user agent
  const isMobile = /iphone|ipod|android|blackberry|opera mini|opera mobi|skyfire|maemo|windows phone|palm|iemobile|symbian|symbianos|fennec/i.test(userAgent);
  
  // Check for tablet-specific strings in user agent
  const isTablet = /ipad|android(?!.*mobile)|tablet|kindle|playbook|silk|(?=.*android)(?=.*mobile)/i.test(userAgent);
  
  // Check screen width as a fallback
  const width = window.innerWidth;
  
  // Determine device type by combining user agent and screen width info
  if (isMobile || width < 768) return 'mobile';
  if (isTablet || (width >= 768 && width < 1024)) return 'tablet';
  return 'desktop';
};
