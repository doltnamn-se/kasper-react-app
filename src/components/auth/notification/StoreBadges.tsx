
import React from 'react';
import { NotificationBadgeProps } from './types';

export const StoreBadges: React.FC<NotificationBadgeProps> = ({
  showGooglePlayBadge,
  showAppleStoreBadge,
  isDarkMode,
  googlePlayStoreURL
}) => {
  return (
    <div className={`flex justify-center items-center mt-8 space-x-8`}>
      {/* Google Play Store - Now with link that opens in new tab */}
      <a 
        href={googlePlayStoreURL}
        className={`store-badge w-32 h-auto transition-opacity hover:opacity-80 animate-fadeInUp ${showGooglePlayBadge ? 'opacity-100' : 'opacity-0'}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ animationDelay: '100ms' }}
        onClick={(e) => {
          e.stopPropagation(); // Prevent event bubbling
        }}
      >
        <img 
          src={isDarkMode ? "/lovable-uploads/ds-googleplay-white.svg" : "/lovable-uploads/ds-googleplay-black.svg"} 
          alt="Get it on Google Play" 
          className="w-full h-full pointer-events-auto"
        />
      </a>
      
      {/* App Store */}
      <a 
        href="#" 
        className={`store-badge w-32 h-auto transition-opacity hover:opacity-80 animate-fadeInUp ${showAppleStoreBadge ? 'opacity-100' : 'opacity-0'}`}
        onClick={(e) => e.preventDefault()}
        style={{ animationDelay: '300ms' }}
      >
        <img 
          src={isDarkMode ? "/lovable-uploads/ds-appstore-comingsoon-white.svg" : "/lovable-uploads/ds-appstore-comingsoon-black.svg"} 
          alt="Download on App Store" 
          className="w-full h-full"
        />
      </a>
    </div>
  );
};
