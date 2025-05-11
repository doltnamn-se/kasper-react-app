
import React, { useEffect, useState } from 'react';

interface NotificationProps {
  isDarkMode?: boolean;
}

interface NotificationMessage {
  title: string;
  body: string;
  time: string;
  id: number;
}

export const IOSNotification: React.FC<NotificationProps> = ({ isDarkMode = false }) => {
  const [currentNotification, setCurrentNotification] = useState<NotificationMessage | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [isChangingText, setIsChangingText] = useState(false);

  // Sample notifications data - all use Digitaltskydd
  const notificationData: NotificationMessage[] = [
    {
      id: 1,
      title: "Digitaltskydd",
      body: "I'll see you bright and early tomorrow.",
      time: "now",
    },
    {
      id: 2,
      title: "Digitaltskydd",
      body: "4 more messages from Michael",
      time: "now",
    },
    {
      id: 3,
      title: "Digitaltskydd",
      body: "Your privacy score has improved by 15%",
      time: "now",
    },
  ];

  useEffect(() => {
    // Initial delay before showing the notification
    const initialTimeout = setTimeout(() => {
      setCurrentNotification(notificationData[0]);
      setShowNotification(true);
    }, 1000);

    let currentIndex = 0;
    
    // Set up interval to change notification content
    const interval = setInterval(() => {
      setIsChangingText(true);
      
      // Add a slight delay to allow the fade-out effect before changing the content
      setTimeout(() => {
        // Move to next notification in the array
        currentIndex = (currentIndex + 1) % notificationData.length;
        setCurrentNotification(notificationData[currentIndex]);
        
        // Small delay before starting the fade in
        setTimeout(() => {
          setIsChangingText(false);
        }, 50);
      }, 300);
    }, 4000); // Change notification content every 4 seconds

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

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
              className={`rounded-xl shadow-lg backdrop-blur-lg transition-all duration-500 ${
                isDarkMode 
                  ? "bg-[#1A1F2C]/80 text-white border border-[#ffffff20]" 
                  : "bg-[#ffffff]/80 text-[#333333] border border-[#00000010]"
              } p-3`}
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
                
                {/* Notification content with smooth transition for text changes */}
                <div className="flex-1 transition-all duration-500">
                  <div className="flex justify-between items-start">
                    <span className={`font-semibold text-sm ${isChangingText ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'} transition-all duration-300`}>
                      {currentNotification.title}
                    </span>
                    <span className={`text-xs opacity-60 ${isChangingText ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'} transition-all duration-300`}>
                      {currentNotification.time}
                    </span>
                  </div>
                  <p className={`text-sm mt-0.5 ${isChangingText ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'} transition-all duration-300`}>
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
