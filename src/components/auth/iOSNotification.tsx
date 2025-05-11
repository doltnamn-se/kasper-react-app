
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNotification } from './notification/useNotification';
import { TypingAnimation } from './notification/TypingAnimation';
import { StoreBadges } from './notification/StoreBadges';
import { NotificationCard } from './notification/NotificationCard';
import { NotificationProps } from './notification/types';
import { getGooglePlayStoreURL } from './notification/notificationData';

export const IOSNotification: React.FC<NotificationProps> = ({ isDarkMode = false }) => {
  const { language } = useLanguage();
  const googlePlayStoreURL = getGooglePlayStoreURL();
  
  // Use the custom hook to handle all notification logic
  const {
    currentNotification,
    showNotification,
    isChangingText,
    notificationHeight,
    contentRef,
    displayText,
    isTypingComplete,
    showTitle,
    showGooglePlayBadge,
    showAppleStoreBadge,
    fullText
  } = useNotification(language, isDarkMode);

  // If no notification is set yet, render nothing
  if (!currentNotification) return null;

  return (
    <div className="ios-notification-container absolute inset-0 flex flex-col items-center justify-between pointer-events-none">
      {/* App download text with typing animation */}
      <TypingAnimation 
        fullText={fullText}
        showTitle={showTitle}
        isDarkMode={isDarkMode}
        displayText={displayText}
        isTypingComplete={isTypingComplete}
      />
      
      {/* Store badges container */}
      <StoreBadges 
        showGooglePlayBadge={showGooglePlayBadge}
        showAppleStoreBadge={showAppleStoreBadge}
        isDarkMode={isDarkMode}
        googlePlayStoreURL={googlePlayStoreURL}
      />
      
      {/* Notification positioned absolutely in center */}
      <div className="absolute top-0 bottom-0 left-0 right-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-[350px] max-w-[90%]">
          <NotificationCard 
            currentNotification={currentNotification}
            isDarkMode={isDarkMode}
            isChangingText={isChangingText}
            notificationHeight={notificationHeight}
            contentRef={contentRef}
            showNotification={showNotification}
          />
        </div>
      </div>
    </div>
  );
};
