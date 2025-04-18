
import { Computer, Smartphone, Tablet } from "lucide-react";

export const getDeviceIcon = (deviceType: string | null) => {
  switch(deviceType) {
    case 'desktop':
      return <Computer className="h-4 w-4 text-gray-500" />;
    case 'mobile':
      return <Smartphone className="h-4 w-4 text-gray-500" />;
    case 'tablet':
      return <Tablet className="h-4 w-4 text-gray-500" />;
    default:
      return null;
  }
};

export const OnlineStatusIndicator = () => (
  <svg width="12" height="12" viewBox="0 0 12 12">
    <defs>
      <filter id="glow">
        <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <circle 
      cx="6" 
      cy="6" 
      r="3" 
      fill="#20f922"
      filter="url(#glow)"
    />
  </svg>
);

export const OfflineStatusIndicator = () => (
  <svg width="12" height="12" viewBox="0 0 12 12">
    <defs>
      <filter id="glow">
        <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <circle 
      cx="6" 
      cy="6" 
      r="3" 
      fill="#ea384c"
      filter="url(#glow)"
    />
  </svg>
);
