import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useLanguage } from '@/contexts/LanguageContext';
import { isWeb } from '@/capacitor';
import { useIsMobile } from '@/hooks/use-mobile';

export const MobileWebDownloadBanner = () => {
  const BANNER_DISMISSED_KEY = 'mobile-download-banner-dismissed';
  const [isDismissed, setIsDismissed] = useState(() => {
    // Check localStorage on initial load
    return localStorage.getItem(BANNER_DISMISSED_KEY) === 'true';
  });
  const [isVisible, setIsVisible] = useState(false);
  const { resolvedTheme } = useTheme();
  const { language } = useLanguage();
  const isDarkMode = resolvedTheme === 'dark';
  const isMobileWeb = useIsMobile() && isWeb();

  // Detect iOS or Android
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  
  const appStoreUrl = 'https://apps.apple.com/se/app/kasper-digitalt-skydd/id6752580645';
  const googlePlayUrl = 'https://play.google.com/store/apps/details?id=app.lovable.d9e386f94e5444ac91d892db773a7ddc';
  const downloadUrl = isIOS ? appStoreUrl : googlePlayUrl;

  // Show banner after 2 second delay
  React.useEffect(() => {
    if (isMobileWeb && !isDismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isMobileWeb, isDismissed]);

  // Don't render if not mobile web or if dismissed
  if (!isMobileWeb || isDismissed) {
    return null;
  }

  const mainText = language === 'sv' ? 'Hämta appen' : 'Get the app';
  const subText = 'App Store & Google Play';
  const downloadText = language === 'sv' ? 'Ladda ned' : 'Download';

  return (
    <div 
      className={`relative z-50 transition-all duration-300 ease-in-out overflow-hidden ${
        isVisible ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
      }`}
      style={{
        paddingTop: isVisible ? 'env(safe-area-inset-top)' : '0',
        backgroundColor: isDarkMode ? '#556249' : '#d4f5b6'
      }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          {/* App Icon */}
          <img 
            src={isDarkMode ? "/lovable-uploads/kasper-mob-icon-darkmode.svg" : "/favicon.ico"}
            alt="App icon" 
            className="w-8 h-8 object-contain"
          />
          
          {/* Text */}
          <div className="flex flex-col">
            <span className="text-xs font-semibold" style={{ color: isDarkMode ? '#ffffff' : '#121212' }}>
              {mainText}
            </span>
            <span className="text-[10px] font-medium" style={{ color: isDarkMode ? '#ffffff' : '#121212' }}>
              {subText}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Download button */}
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-full text-xs font-medium transition-colors"
            style={{ 
              backgroundColor: isDarkMode ? '#ffffff' : '#121212',
              color: isDarkMode ? '#121212' : '#ffffff'
            }}
          >
            {downloadText}
          </a>
          
          {/* Close button */}
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => {
                setIsDismissed(true);
                localStorage.setItem(BANNER_DISMISSED_KEY, 'true');
              }, 300);
            }}
            className="p-1 rounded-full hover:bg-black/5 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" style={{ color: isDarkMode ? '#ffffff' : '#121212' }} />
          </button>
        </div>
      </div>
    </div>
  );
};
