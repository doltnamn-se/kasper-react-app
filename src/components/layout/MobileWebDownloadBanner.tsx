import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useLanguage } from '@/contexts/LanguageContext';
import { isWeb } from '@/capacitor';
import { useIsMobile } from '@/hooks/use-mobile';

export const MobileWebDownloadBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const { resolvedTheme } = useTheme();
  const { language } = useLanguage();
  const isDarkMode = resolvedTheme === 'dark';
  const isMobileWeb = useIsMobile() && isWeb();

  // Don't show if not mobile web or if dismissed
  if (!isMobileWeb || !isVisible) {
    return null;
  }

  const text = language === 'sv' ? 'Ladda ner appen' : 'Download the app';
  const googlePlayUrl = "https://play.google.com/store/apps/details?id=app.lovable.d9e386f94e5444ac91d892db773a7ddc";

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 ${
        isDarkMode ? 'bg-[#1a1a1a]' : 'bg-[#fafafa]'
      } border-b ${isDarkMode ? 'border-white/10' : 'border-black/10'}`}
      style={{
        paddingTop: 'env(safe-area-inset-top)'
      }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>
          {text}
        </span>
        
        <div className="flex items-center gap-2">
          {/* Google Play Badge */}
          <a 
            href={googlePlayUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="h-8 hover:opacity-80 transition-opacity"
          >
            <img 
              src={isDarkMode ? "/lovable-uploads/ds-googleplay-white.svg" : "/lovable-uploads/ds-googleplay-black.svg"} 
              alt="Get it on Google Play" 
              className="h-full w-auto"
            />
          </a>
          
          {/* App Store Badge */}
          <a 
            href="#" 
            onClick={(e) => e.preventDefault()}
            className="h-8 hover:opacity-80 transition-opacity"
          >
            <img 
              src={isDarkMode ? "/lovable-uploads/ds-appstore-comingsoon-white.svg" : "/lovable-uploads/ds-appstore-comingsoon-black.svg"} 
              alt="Download on App Store" 
              className="h-full w-auto"
            />
          </a>

          {/* Close button */}
          <button
            onClick={() => setIsVisible(false)}
            className={`ml-2 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors`}
            aria-label="Close"
          >
            <X className={`w-4 h-4 ${isDarkMode ? 'text-white' : 'text-black'}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
