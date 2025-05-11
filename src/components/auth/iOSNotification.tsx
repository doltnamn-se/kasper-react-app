
import React, { useEffect, useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import gsap from 'gsap';
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface NotificationProps {
  isDarkMode?: boolean;
}

export const IOSNotification: React.FC<NotificationProps> = ({ isDarkMode = false }) => {
  const { language } = useLanguage();
  const [showNotification, setShowNotification] = useState(false);
  const [notificationHeight, setNotificationHeight] = useState<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
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

  // GSAP typing animation effect with proper cleanup
  useEffect(() => {
    // Reset states when language changes
    setDisplayText('');
    setIsTypingComplete(false);
    
    if (!showTitle) return;
    
    // Create a GSAP context for better cleanup
    gsapContextRef.current = gsap.context(() => {
      // Create typing timeline with GSAP
      const typingTimeline = gsap.timeline({
        onComplete: () => {
          setIsTypingComplete(true);
          
          // Show Google Play badge with 2 sec delay after typing completes
          gsap.delayedCall(2, () => {
            setShowGooglePlayBadge(true);
            
            // Show Apple Store badge with 500ms after Google Play
            gsap.delayedCall(0.5, () => {
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

  useEffect(() => {
    // Initial delay before showing the notification
    const initialTimeout = setTimeout(() => {
      setShowNotification(true);
      
      // Initial height measurement after render
      setTimeout(() => {
        if (contentRef.current) {
          setNotificationHeight(contentRef.current.offsetHeight);
        }
      }, 100);
    }, 200); 
    
    return () => {
      clearTimeout(initialTimeout);
    };
  }, [language]);

  // Privacy Score data - using real values from the platform
  const score = {
    total: 75,
    individual: {
      guides: 80,
      urls: 60,
      monitoring: 100,
      address: 60
    }
  };

  // Animation for the score
  const [animatedScore, setAnimatedScore] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (!showNotification) return;
    
    const animationContext = gsap.context(() => {
      gsap.to({}, {
        duration: 1.5,
        onUpdate: () => {
          const progress = gsap.getProperty({}, "progress");
          if (progress !== undefined) {
            const newScore = Math.min(Math.round(score.total * Number(progress)), score.total);
            setDisplayScore(newScore);
            setAnimatedScore(newScore);
          }
        }
      });
    });
    
    return () => {
      animationContext.revert();
    };
  }, [score.total, showNotification]);

  const getProtectionLevel = (score: number) => {
    if (score === 100) return language === 'sv' ? "Fullt skyddad" : "Fully protected";
    if (score >= 90) return language === 'sv' ? "Säkert skydd" : "Safe protection";
    if (score >= 75) return language === 'sv' ? "Bra skydd" : "Good protection";
    if (score >= 50) return language === 'sv' ? "Hyfsat skydd" : "Decent protection";
    if (score >= 25) return language === 'sv' ? "Dåligt skydd" : "Poor protection";
    return language === 'sv' ? "Inget skydd" : "No protection";
  };

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
      
      {/* Privacy Score Card in the center - now using the actual design from the platform */}
      <div className="flex-grow flex items-center justify-center">
        <div className="relative w-[300px] max-w-[85%]">
          {showNotification && (
            <div className="ios-notification absolute left-0 right-0 animate-fadeInUp">
              <div 
                className={`notification-card rounded-xl shadow-lg backdrop-blur-lg ${
                  isDarkMode 
                    ? "bg-[#1A1F2C]/80 text-white border border-[#ffffff20]" 
                    : "bg-[#ffffff]/80 text-[#333333] border border-[#00000010]"
                } p-3`}
                style={{
                  height: notificationHeight ? `${notificationHeight + 24}px` : 'auto',
                  transition: 'height 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                  willChange: 'height, transform',
                  overflow: 'hidden'
                }}
              >
                <div className="flex items-start">
                  {/* App icon container with vertical centering */}
                  <div className="mr-3 flex items-center h-full" style={{
                    minHeight: notificationHeight ? `${notificationHeight}px` : 'auto',
                    transition: 'min-height 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}>
                    <div className="w-8 h-8 rounded-md flex items-center justify-center overflow-hidden bg-[#20a5fb]">
                      <img 
                        src="/lovable-uploads/digitaltskydd-admin-logo.svg" 
                        alt="Digitaltskydd" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  
                  {/* Privacy Score Card Content */}
                  <div 
                    ref={contentRef}
                    className="flex-1 notification-content"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-semibold text-sm">
                        Digitaltskydd
                      </span>
                      <span className="text-xs opacity-60">
                        {language === 'sv' ? 'nu' : 'now'}
                      </span>
                    </div>
                    
                    {/* Privacy Score content */}
                    <h3 className="font-semibold text-sm mt-1">
                      {language === 'sv' ? 'Hur skyddad är du?' : 'How protected are you?'}
                    </h3>
                    
                    {/* Score Display */}
                    <div className="mt-2 mb-2">
                      <div className="flex justify-between items-center">
                        <div className="text-xl font-bold">
                          {displayScore}%
                        </div>
                        <div className="w-3/4 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div 
                            className="bg-[#20a5fb] h-2.5 rounded-full" 
                            style={{ width: `${animatedScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Score Details */}
                    <div className="text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span>{language === 'sv' ? 'Upplysningssidor' : 'Search sites'}</span>
                        <span>{score.individual.guides}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{language === 'sv' ? 'Länkar' : 'Links'}</span>
                        <span>{score.individual.urls}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{language === 'sv' ? 'Bevakning' : 'Monitoring'}</span>
                        <span>{score.individual.monitoring}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{language === 'sv' ? 'Adresslarm' : 'Address Alerts'}</span>
                        <span>{score.individual.address}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Empty div to maintain spacing in flex container */}
      <div className="mb-6"></div>
    </div>
  );
};
