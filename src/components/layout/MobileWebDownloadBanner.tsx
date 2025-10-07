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
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        backgroundColor: '#d4f5b6'
      }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {/* App Icon */}
          <img 
            src="/favicon.ico" 
            alt="App icon" 
            className="w-6 h-6 rounded-lg object-contain"
          />
          
          {/* Text */}
          <div className="flex flex-col">
            <span className="text-xs font-medium" style={{ color: '#121212' }}>
              {mainText}
            </span>
            <span className="text-[10px]" style={{ color: '#121212', opacity: 0.6 }}>
              {subText}
            </span>
          </div>
        </div>
        
        {/* Close button */}
        <button
          onClick={() => setIsVisible(false)}
          className="p-1 rounded-full hover:bg-black/5 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" style={{ color: '#121212' }} />
        </button>
      </div>
    </div>
  );
};
