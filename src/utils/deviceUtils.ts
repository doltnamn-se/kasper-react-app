
export const getWebDeviceType = (): 'desktop' | 'mobile' | 'tablet' => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') return 'desktop';

  const width = window.innerWidth;
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  if (!hasTouch || width > 1024) return 'desktop';
  if (width < 768) return 'mobile';
  return 'tablet';
};
