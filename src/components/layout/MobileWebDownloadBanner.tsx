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

  const mainText = language === 'sv' ? 'Hämta appen' : 'Get the app';
  const subText = 'App Store & Google Play';
  const downloadText = language === 'sv' ? 'Ladda ned' : 'Download';

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        backgroundColor: '#d4f5b6'
      }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          {/* App Icon */}
          <img 
            src="/favicon.ico" 
            alt="App icon" 
            className="w-8 h-8 object-contain"
          />
          
          {/* Text */}
          <div className="flex flex-col">
            <span className="text-xs font-semibold" style={{ color: '#121212' }}>
              {mainText}
            </span>
            <span className="text-[10px] font-medium" style={{ color: '#121212', opacity: 0.6 }}>
              {subText}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Download button */}
          <button
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
            style={{ 
              backgroundColor: isDarkMode ? '#ffffff' : '#121212',
              color: isDarkMode ? '#121212' : '#ffffff'
            }}
          >
            {downloadText}
          </button>
          
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
    </div>
  );
};
