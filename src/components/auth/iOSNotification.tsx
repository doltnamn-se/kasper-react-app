import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface NotificationProps {
  isDarkMode?: boolean;
}

export const IOSNotification: React.FC<NotificationProps> = ({ isDarkMode = false }) => {
  const { language } = useLanguage();
  
  // Typing animation states
  const [displayText, setDisplayText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showGooglePlayBadge, setShowGooglePlayBadge] = useState(false);
  const [showAppleStoreBadge, setShowAppleStoreBadge] = useState(false);
  
  // Updated title text with new messages
  const fullText = language === 'sv' 
    ? "Ladda ner appen" 
    : "Download the app";

  // Google Play Store URL
  const googlePlayStoreURL = "https://play.google.com/store/apps/details?id=app.lovable.d9e386f94e5444ac91d892db773a7ddc";

  // Show title with delay
  useEffect(() => {
    const titleDelay = setTimeout(() => {
      setShowTitle(true);
    }, 1500); // 1.5 seconds delay
    
    return () => clearTimeout(titleDelay);
  }, []);

  // Typing animation effect
  useEffect(() => {
    // Reset the typing animation when language changes
    setDisplayText('');
    setIsTypingComplete(false);
    
    if (!showTitle) return;
    
    let i = 0;
    let animationText = '';
    
    // Start typing animation with a slight delay
    const typingDelay = setTimeout(() => {
      // Force render the first character immediately
      setDisplayText(fullText.charAt(0));
      i = 1; // Start from second character
      
      const typingInterval = setInterval(() => {
        if (i < fullText.length) {
          animationText = fullText.substring(0, i + 1);
          setDisplayText(animationText);
          i++;
        } else {
          clearInterval(typingInterval);
          setIsTypingComplete(true);
          
          // Show Google Play badge with 2 sec delay after typing completes
          setTimeout(() => {
            setShowGooglePlayBadge(true);
            
            // Show Apple Store badge with 500ms delay after Google Play
            setTimeout(() => {
              setShowAppleStoreBadge(true);
            }, 500);
          }, 2000);
        }
      }, 30);
      
      return () => clearInterval(typingInterval);
    }, 200);
    
    return () => clearTimeout(typingDelay);
  }, [fullText, showTitle]);

  return (
    <div className="ios-notification-container absolute inset-0 flex items-center justify-center pointer-events-none">
      {/* App download text with typing animation - Centered vertically and horizontally */}
      <div className={`text-center px-6 overflow-visible transition-opacity duration-500 ease-in-out ${showTitle ? 'opacity-100' : 'opacity-0'}`}>
        <p className={`text-xl font-[500] ${
          isDarkMode ? "text-white" : "text-black"
        } typing-animation`}>
          {displayText}
          {!isTypingComplete && <span className="cursor-blink">|</span>}
        </p>
        
        {/* Store badges container - Centered */}
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
      </div>
    </div>
  );
};
