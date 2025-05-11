
import { useState, useEffect, useRef } from 'react';
import { NotificationMessage } from './types';
import { getNotificationData, getLocalizedHeaderText } from './notificationData';
import { Language } from '@/contexts/LanguageContext';

export const useNotification = (language: Language, isDarkMode: boolean = false) => {
  // State for notification data
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
  
  // Get notification data based on current language
  const notificationData = getNotificationData(language);
  const fullText = getLocalizedHeaderText(language);

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
            
            // Show Apple Store badge with 2.5 sec delay after typing completes
            setTimeout(() => {
              setShowAppleStoreBadge(true);
            }, 500); // 500ms additional delay after Google Play
          }, 2000); // 2 sec delay for Google Play badge
        }
      }, 30); // Speed of typing (lower = faster)
      
      return () => clearInterval(typingInterval);
    }, 200); // Delay before typing starts
    
    return () => clearTimeout(typingDelay);
  }, [fullText, showTitle]);

  // Notification display effect
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
    }, 200); // 200 milliseconds delay

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
  }, [language, notificationData]);

  return {
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
  };
};
