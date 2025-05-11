
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

  // Localized notifications data
  const notificationData: NotificationMessage[] = [
    {
      id: 1,
      title: "Digitaltskydd",
      heading: language === 'sv' ? "Länkar" : "Links",
      body: language === 'sv' 
        ? "Borttagning på Google är godkänd för en eller flera av dina länkar"
        : "Removal from Google is approved for one or several of your links",
      time: "now",
    },
    {
      id: 2,
      title: "Digitaltskydd",
      heading: language === 'sv' ? "Status" : "Status",
      body: language === 'sv' 
        ? "Grattis! Du är nu fyllt skyddad🥳"
        : "Congratulations! You are now fully protected🥳",
      time: "now",
    },
    {
      id: 3,
      title: "Digitaltskydd",
      heading: language === 'sv' ? "Bevakning" : "Monitoring",
      body: language === 'sv' 
        ? "Du har en ny träff på Google. Vill du att vi tar bort den?"
        : "You have a new hit on Google. Do you want us to remove it?",
      time: "now",
    },
  ];

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
    }, 1000);

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
    <div className="ios-notification-container absolute inset-0 flex items-center justify-center pointer-events-none">
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
                {/* App icon - always using Digitaltskydd */}
                <div className="mr-3 mt-0.5">
                  <div className="w-8 h-8 rounded-md flex items-center justify-center overflow-hidden bg-[#20a5fb]">
                    <img 
                      src="/lovable-uploads/digitaltskydd-admin-logo.svg" 
                      alt="Digitaltskydd" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                {/* Notification content with animation only for the body text */}
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
                  
                  {/* Updated heading to match the font-weight and color of the title */}
                  <h3 className="font-semibold text-sm mt-1">
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
  );
};
