
import React, { useEffect, useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import gsap from 'gsap';

interface NotificationProps {
  isDarkMode?: boolean;
}

export const IOSNotification: React.FC<NotificationProps> = ({ isDarkMode = false }) => {
  const { language } = useLanguage();
  const textRef = useRef<HTMLSpanElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  
  // States
  const [showGooglePlayBadge, setShowGooglePlayBadge] = useState(false);
  const [showAppleStoreBadge, setShowAppleStoreBadge] = useState(false);
  
  // Updated title text with new longer messages
  const fullText = language === 'sv' 
    ? "Håll koll med appen när du är på språng" 
    : "Keep track with the app when you're on-the-go";

  // Google Play Store URL
  const googlePlayStoreURL = "https://play.google.com/store/apps/details?id=app.lovable.d9e386f94e5444ac91d892db773a7ddc";

  // GSAP reveal animation effect
  useEffect(() => {
    // Make sure text is visible first
    if (textRef.current) {
      textRef.current.textContent = fullText;
      
      // Create GSAP timeline for reveal animation
      const tl = gsap.timeline();
      
      // Set initial state (hidden with mask)
      gsap.set(textRef.current, {
        clipPath: "inset(0 100% 0 0)",
        opacity: 0
      });
      
      // Reveal animation from left to right
      tl.to(textRef.current, {
        clipPath: "inset(0 0% 0 0)",
        opacity: 1,
        duration: 1.2,
        ease: "power2.out"
      });
      
      // After reveal completes, show badges
      tl.call(() => {
        // Show Google Play badge with delay
        setTimeout(() => {
          setShowGooglePlayBadge(true);
          
          // Show Apple Store badge with additional delay
          setTimeout(() => {
            setShowAppleStoreBadge(true);
          }, 500);
        }, 500);
      });
      
      // Play the timeline
      tl.play();
    }
    
    // Cleanup
    return () => {
      // No cleanup needed for this animation
    };
  }, [fullText]); // Re-run when language changes

  return (
    <div className="ios-notification-container absolute inset-0 flex items-center justify-center pointer-events-none">
      {/* App download text with reveal animation - Center aligned */}
      <div className="text-center px-6 overflow-visible transition-opacity duration-500 ease-in-out opacity-100">
        <p className={`text-xl font-[500] ${isDarkMode ? "text-white" : "text-black"}`}>
          <span ref={textRef}></span>
        </p>
        
        {/* Store badges container */}
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
