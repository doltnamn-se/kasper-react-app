
import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { NotificationProps, NotificationMessage } from './notifications/NotificationTypes';
import { getNotificationData } from './notifications/notificationData';
import { TypingAnimation } from './notifications/TypingAnimation';
import { NotificationCard } from './notifications/NotificationCard';

export const IOSNotification: React.FC<NotificationProps> = ({ isDarkMode = false }) => {
  const { language } = useLanguage();
  const [currentNotification, setCurrentNotification] = useState<NotificationMessage | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [isChangingText, setIsChangingText] = useState(false);
  
  const fullText = language === 'sv' 
    ? "Ladda ner appen för när du är på språng" 
    : "Download the app for when you're on-the-go";

  // Get notification data based on current language
  const notificationData = getNotificationData(language);

  useEffect(() => {
    // Initial delay before showing the notification
    const initialTimeout = setTimeout(() => {
      setCurrentNotification(notificationData[0]);
      setShowNotification(true);
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
  }, [language, notificationData]);

  // If no notification is set yet, render nothing
  if (!currentNotification) return null;

  return (
    <div className="ios-notification-container absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      {/* App download text with typing animation */}
      <TypingAnimation fullText={fullText} isDarkMode={isDarkMode} />
      
      <div className="relative w-[300px] max-w-[85%]">
        {showNotification && (
          <div className="ios-notification absolute left-0 right-0 animate-fadeInUp">
            <NotificationCard
              notification={currentNotification}
              isDarkMode={isDarkMode}
              isChangingText={isChangingText}
            />
          </div>
        )}
      </div>
    </div>
  );
};
