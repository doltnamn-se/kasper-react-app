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

  const mainText = language === 'sv' ? 'Ladda ner appen' : 'Download the app';
  const subText = language === 'sv' ? 'På App Store & Google Play' : 'On App Store & Google Play';

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
        <div className="flex items-center gap-3">
          {/* App Icon */}
          <img 
            src="/favicon.ico" 
            alt="App icon" 
            className="w-10 h-10 rounded-lg object-contain"
          />
          
          {/* Text */}
          <div className="flex flex-col">
            <span className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>
              {mainText}
            </span>
            <span className={`text-[10px] ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>
              {subText}
            </span>
          </div>
        </div>
        
        {/* Close button */}
        <button
          onClick={() => setIsVisible(false)}
          className={`p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors`}
          aria-label="Close"
        >
          <X className={`w-4 h-4 ${isDarkMode ? 'text-white' : 'text-black'}`} />
        </button>
      </div>
    </div>
  );
};
