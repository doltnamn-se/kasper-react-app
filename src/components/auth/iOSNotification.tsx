
import React, { useEffect, useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface NotificationProps {
  isDarkMode?: boolean;
}

interface NotificationMessage {
  title: string;
  body: string;
  time: string;
  id: number;
  heading: string;
}

export const IOSNotification: React.FC<NotificationProps> = ({ isDarkMode = false }) => {
  const { language } = useLanguage();
  const [currentNotification, setCurrentNotification] = useState<NotificationMessage | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [isChangingText, setIsChangingText] = useState(false);
  const [notificationHeight, setNotificationHeight] = useState<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Typing animation states
  const [displayText, setDisplayText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showGooglePlayBadge, setShowGooglePlayBadge] = useState(false);
  const [showAppleStoreBadge, setShowAppleStoreBadge] = useState(false);
  
  const fullText = language === 'sv' 
    ? "Ladda ner appen och håll koll när du är på språng" 
    : "Download the app and stay connected on the go";

  // Localized notifications data with two new notifications added
  const notificationData: NotificationMessage[] = [
    {
      id: 1,
      title: "Digitaltskydd",
      heading: language === 'sv' ? "Länkar" : "Links",
      body: language === 'sv' 
        ? "Borttagning på Google är godkänd för en eller flera av dina länkar"
        : "Removal from Google is approved for one or several of your links",
      time: language === 'sv' ? "nu" : "now",
    },
    {
      id: 2,
      title: "Digitaltskydd",
      heading: language === 'sv' ? "Status" : "Status",
      body: language === 'sv' 
        ? "Grattis! Du är nu fyllt skyddad🥳"
        : "Congratulations! You are now fully protected🥳",
      time: language === 'sv' ? "nu" : "now",
    },
    {
      id: 3,
      title: "Digitaltskydd",
      heading: language === 'sv' ? "Bevakning" : "Monitoring",
      body: language === 'sv' 
        ? "Du har en ny träff på Google. Vill du att vi tar bort den?"
        : "You have a new hit on Google. Do you want us to remove it?",
      time: language === 'sv' ? "nu" : "now",
    },
    {
      id: 4,
      title: "Digitaltskydd",
      heading: language === 'sv' ? "Upplysningssidor" : "Search sites",
      body: language === 'sv' 
        ? "Du är nu borttagen på Mrkoll"
        : "You are now removed from Mrkoll",
      time: language === 'sv' ? "nu" : "now",
    },
    {
      id: 5,
      title: "Digitaltskydd",
      heading: language === 'sv' ? "Länkar" : "Links",
      body: language === 'sv' 
        ? "Statusen för en eller flera av dina länkar har uppdaterats"
        : "The status for one or more of your links has been updated",
      time: language === 'sv' ? "nu" : "now",
    },
  ];

  // Show title with delay
  useEffect(() => {
    const titleDelay = setTimeout(() => {
      setShowTitle(true);
    }, 1500); // 1.5 seconds delay
    
    return () => clearTimeout(titleDelay);
  }, []);

  // Typing animation effect - Improved to ensure the first letter displays correctly
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
          
          // Updated: Show Google Play badge with 2 sec delay after typing completes
          setTimeout(() => {
            setShowGooglePlayBadge(true);
            
            // Updated: Show Apple Store badge with 2.5 sec delay after typing completes (500ms after Google Play)
            setTimeout(() => {
              setShowAppleStoreBadge(true);
            }, 500); // 500ms additional delay after Google Play (total 2.5 sec from typing completion)
          }, 2000); // 2 sec delay for Google Play badge
        }
      }, 30); // Speed of typing (lower = faster)
      
      return () => clearInterval(typingInterval);
    }, 200); // Delay before typing starts
    
    return () => clearTimeout(typingDelay);
  }, [fullText, showTitle]);

  useEffect(() => {
    // Initial delay before showing the notification
    const initialTimeout = setTimeout(() => {
      setCurrentNotification(notificationData[0]);
      setShowNotification(true);
      
      // Initial height measurement after render
      setTimeout(() => {
        if (contentRef.current) {
          setNotificationHeight(contentRef.current.offsetHeight);
        }
      }, 100);
    }, 200); // Changed from 1000 to 200 milliseconds

    let currentIndex = 0;
    
    // Set up interval to change notification content
    const interval = setInterval(() => {
      // Begin transition - fade out text first
      setIsChangingText(true);
      
      // Add a slight delay to allow the fade-out effect before changing the content
      setTimeout(() => {
        // Move to next notification in the array
        currentIndex = (currentIndex + 1) % notificationData.length;
        setCurrentNotification(notificationData[currentIndex]);
        
        // Small delay before starting the fade in
        setTimeout(() => {
          // Measure new height after content change
          if (contentRef.current) {
            setNotificationHeight(contentRef.current.offsetHeight);
          }
          
          // Then fade in the text
          setTimeout(() => {
            setIsChangingText(false);
          }, 50);
        }, 100);
      }, 300);
    }, 4000); // Change notification content every 4 seconds

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [language]);

  // If no notification is set yet, render nothing
  if (!currentNotification) return null;

  return (
    <div className="ios-notification-container absolute inset-0 flex flex-col items-center justify-between pointer-events-none">
      {/* App download text with typing animation - Moved further down with more padding */}
      <div className={`mt-24 text-center px-6 overflow-visible transition-opacity duration-500 ease-in-out ${showTitle ? 'opacity-100' : 'opacity-0'}`}>
        <p className={`text-xl font-[500] ${
          isDarkMode ? "text-white" : "text-black"
        } typing-animation`}>
          {displayText}
          {!isTypingComplete && <span className="cursor-blink">|</span>}
        </p>
        
        {/* Store badges container with fade-in-up animation - Increased spacing */}
        <div className={`flex justify-center items-center mt-8 space-x-8`}>
          {/* Google Play Store */}
          <a 
            href="#" 
            className={`store-badge w-32 h-auto transition-opacity hover:opacity-80 animate-fadeInUp ${showGooglePlayBadge ? 'opacity-100' : 'opacity-0'}`}
            onClick={(e) => e.preventDefault()}
            style={{ animationDelay: '100ms' }}
          >
            <img 
              src={isDarkMode ? "/lovable-uploads/ds-googleplay-white.svg" : "/lovable-uploads/ds-googleplay-black.svg"} 
              alt="Get it on Google Play" 
              className="w-full h-full"
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
      
      {/* Notification in the center */}
      <div className="flex-grow flex items-center justify-center">
        <div className="relative w-[300px] max-w-[85%]">
          {showNotification && (
            <div
              className="ios-notification absolute left-0 right-0 animate-fadeInUp"
            >
              <div 
                className={`notification-card rounded-xl shadow-lg backdrop-blur-lg ${
                  isDarkMode 
                    ? "bg-[#1A1F2C]/80 text-white border border-[#ffffff20]" 
                    : "bg-[#ffffff]/80 text-[#333333] border border-[#00000010]"
                } p-3`}
                style={{
                  height: notificationHeight ? `${notificationHeight + 24}px` : 'auto', // 24px accounts for padding
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
                  
                  {/* Notification content with animation for both heading and body text */}
                  <div 
                    ref={contentRef}
                    className="flex-1 notification-content"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-semibold text-sm">
                        {currentNotification.title}
                      </span>
                      <span className="text-xs opacity-60">
                        {currentNotification.time}
                      </span>
                    </div>
                    
                    {/* Updated heading with the same animation as body text */}
                    <h3 className={`font-semibold text-sm mt-1 ${isChangingText ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'} transition-opacity transition-transform duration-300 ease-in-out`}>
                      {currentNotification.heading}
                    </h3>
                    
                    <p className={`text-sm mt-0.5 notification-body ${isChangingText ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'}`}>
                      {currentNotification.body}
                    </p>
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
