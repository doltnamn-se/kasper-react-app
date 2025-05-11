
import React, { useEffect, useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import gsap from 'gsap';

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
  const textRef = useRef<HTMLParagraphElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const gsapContextRef = useRef<gsap.Context | null>(null);
  
  const fullText = language === 'sv' 
    ? "Ladda ner appen och håll koll när du är på språng" 
    : "Download the app and stay connected on the go";

  // Show title with delay
  useEffect(() => {
    const titleDelay = setTimeout(() => {
      setShowTitle(true);
    }, 1500); // 1.5 seconds delay
    
    return () => clearTimeout(titleDelay);
  }, []);

  // GSAP typing animation effect
  useEffect(() => {
    // Reset states when language changes
    setDisplayText('');
    setIsTypingComplete(false);
    
    if (!showTitle) return;
    
    // Kill any existing animations to prevent conflicts
    if (gsapContextRef.current) {
      gsapContextRef.current.kill();
    }

    // Create a GSAP context for better cleanup
    gsapContextRef.current = gsap.context(() => {
      // Create typing timeline with GSAP
      const typingTimeline = gsap.timeline({
        onComplete: () => {
          setIsTypingComplete(true);
          
          // Show Google Play badge with 2 sec delay after typing completes
          const googlePlayDelay = gsap.delayedCall(2, () => {
            setShowGooglePlayBadge(true);
            
            // Show Apple Store badge with 2.5 sec delay after typing completes (500ms after Google Play)
            const appleStoreDelay = gsap.delayedCall(0.5, () => {
              setShowAppleStoreBadge(true);
            });
          });
        }
      });
      
      // Small initial delay
      typingTimeline.delay(0.2);
      
      // Add each character with a staggered effect for more natural typing
      let chars = fullText.split('');
      chars.forEach((char, index) => {
        typingTimeline.add(() => {
          setDisplayText(prevText => prevText + char);
        }, index * 0.03); // Slightly randomized typing speed for natural effect
      });

      // Start the animation
      typingTimeline.play();
      
      // Setup blinking cursor animation
      if (cursorRef.current) {
        gsap.to(cursorRef.current, {
          opacity: 0,
          duration: 0.5,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut"
        });
      }
    });
    
    // Cleanup function to prevent memory leaks and animation conflicts
    return () => {
      if (gsapContextRef.current) {
        gsapContextRef.current.revert(); // This will kill all animations created in this context
      }
    };
  }, [fullText, showTitle, language]);

  return (
    <div className="ios-notification-container absolute inset-0 flex flex-col items-center justify-between pointer-events-none">
      {/* App download text with typing animation - Moved further down with more padding */}
      <div className={`mt-24 text-center px-6 overflow-visible transition-opacity duration-500 ease-in-out ${showTitle ? 'opacity-100' : 'opacity-0'}`}>
        <p 
          ref={textRef}
          className={`text-xl font-[500] ${
            isDarkMode ? "text-white" : "text-black"
          } typing-animation`}
        >
          {displayText}
          <span 
            ref={cursorRef} 
            className={isTypingComplete ? 'opacity-0' : 'inline'}
          >|</span>
        </p>
        
        {/* Store badges container with fade-in-up animation - Increased spacing */}
        <div className={`flex justify-center items-center mt-8 space-x-8`}>
          {/* Google Play Store */}
          <div 
            className={`store-badge w-32 h-auto transition-opacity hover:opacity-80 animate-fadeInUp ${showGooglePlayBadge ? 'opacity-100' : 'opacity-0'}`}
            style={{ animationDelay: '100ms' }}
          >
            <img 
              src={isDarkMode ? "/lovable-uploads/ds-googleplay-white.svg" : "/lovable-uploads/ds-googleplay-black.svg"} 
              alt="Get it on Google Play" 
              className="w-full h-full"
            />
          </div>
          
          {/* App Store */}
          <div 
            className={`store-badge w-32 h-auto transition-opacity hover:opacity-80 animate-fadeInUp ${showAppleStoreBadge ? 'opacity-100' : 'opacity-0'}`}
            style={{ animationDelay: '300ms' }}
          >
            <img 
              src={isDarkMode ? "/lovable-uploads/ds-appstore-comingsoon-white.svg" : "/lovable-uploads/ds-appstore-comingsoon-black.svg"} 
              alt="Download on App Store" 
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
      
      {/* Empty central div - removed the notification card */}
      <div className="flex-grow"></div>
      
      {/* Empty div to maintain spacing in flex container */}
      <div className="mb-6"></div>
    </div>
  );
};
