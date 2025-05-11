
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
  const [showPrivacyScore, setShowPrivacyScore] = useState(false);
  const [notificationHeight, setNotificationHeight] = useState<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Typing animation states
  const [displayText, setDisplayText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const gsapContextRef = useRef<gsap.Context | null>(null);
  
  const fullText = language === 'sv' 
    ? "Håll koll på ditt digitala skydd" 
    : "Track your digital protection";

  // Show title with delay
  useEffect(() => {
    const titleDelay = setTimeout(() => {
      setShowTitle(true);
    }, 500);
    
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
      setShowPrivacyScore(true);
      
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

  // Privacy Score data
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
    if (!showPrivacyScore) return;
    
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
  }, [score.total, showPrivacyScore]);

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
      {/* Privacy Score heading with typing animation */}
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
      </div>
      
      {/* Privacy Score Card in the center */}
      <div className="flex-grow flex items-center justify-center">
        <div className="relative w-[300px] max-w-[85%]">
          {showPrivacyScore && (
            <div className="privacy-score-card animate-fadeInUp">
              <Card className={`p-5 shadow-lg ${
                isDarkMode 
                  ? "bg-[#1A1F2C]/80 text-white border border-[#ffffff20]" 
                  : "bg-[#ffffff]/80 text-[#333333] border border-[#00000010]"
              } backdrop-blur-lg`}>
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {language === 'sv' ? 'Hur skyddad är du?' : 'How protected are you?'}
                    </h2>
                    <p className={`${isDarkMode ? "text-[#FFFFFFA6]" : "text-[#000000A6]"} font-medium text-sm mb-4`}>
                      {language === 'sv' ? 'Din aktuella skyddsnivå' : 'Your current protection level'}
                    </p>
                  </div>
                  
                  <div className="space-y-0">
                    <span className={`text-5xl font-medium ${isDarkMode ? "text-white" : "text-[#000000]"}`}>
                      {displayScore}
                    </span>
                    <p className={`${isDarkMode ? "text-[#FFFFFFA6]" : "text-[#000000A6]"} text-sm font-medium mt-1 mb-4`}>
                      {getProtectionLevel(score.total)}
                    </p>
                    
                    {/* Progress bar */}
                    <div className="w-full">
                      <div className="relative w-full h-3 rounded-lg overflow-hidden">
                        <div className={`absolute inset-0 ${isDarkMode ? "bg-[#2f2e31]" : "bg-[#e8e8e5]"}`} />
                        <div 
                          className="absolute top-0 left-0 h-full transition-all rounded-r-lg"
                          style={{ 
                            width: `${animatedScore}%`,
                            background: `linear-gradient(90deg, 
                              rgba(234, 56, 76, 1) 0%,
                              rgb(249, 115, 22) 35%,
                              rgba(251, 209, 4, 255) 70%,
                              rgba(17, 84, 242, 255) 88%,
                              rgba(25, 208, 91, 255) 100%
                            )`,
                            backgroundSize: `${100 / (score.total / 100)}% 100%`,
                            transition: 'width 1000ms ease-out'
                          }} 
                        />
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>0</span>
                        <span>100</span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  {/* Score Details */}
                  <div className="text-sm space-y-2.5" ref={contentRef}>
                    <div className="flex justify-between items-center">
                      <span>{language === 'sv' ? 'Upplysningssidor' : 'Search sites'}</span>
                      <span className="font-medium">{score.individual.guides}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>{language === 'sv' ? 'Länkar' : 'Links'}</span>
                      <span className="font-medium">{score.individual.urls}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>{language === 'sv' ? 'Bevakning' : 'Monitoring'}</span>
                      <span className="font-medium">{score.individual.monitoring}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>{language === 'sv' ? 'Adresslarm' : 'Address Alerts'}</span>
                      <span className="font-medium">{score.individual.address}%</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
      
      {/* Empty div to maintain spacing in flex container */}
      <div className="mb-6"></div>
    </div>
  );
};
