
import React, { useEffect, useState } from 'react';

interface NotificationProps {
  isDarkMode?: boolean;
}

interface NotificationMessage {
  title: string;
  body: string;
  time: string;
}

export const IOSNotification: React.FC<NotificationProps> = ({ isDarkMode = false }) => {
  const [activeNotification, setActiveNotification] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<'up' | 'down'>('up');

  // Sample notifications - these can be replaced later
  const notifications: NotificationMessage[] = [
    {
      title: "Digitaltskydd",
      body: "We've detected a new website with your information",
      time: "now",
    },
    {
      title: "Digitaltskydd",
      body: "Your privacy score has improved by 15%",
      time: "now",
    },
    {
      title: "Digitaltskydd",
      body: "3 websites have been successfully removed",
      time: "now",
    },
  ];

  useEffect(() => {
    // Initial animation delay
    const initialTimeout = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    // Set up rotation between notifications
    const interval = setInterval(() => {
      // First hide the current notification
      setIsVisible(false);
      
      // Alternate animation direction for more visual interest
      setAnimationDirection(prev => prev === 'up' ? 'down' : 'up');
      
      // Wait for fade out, then change to next notification and fade in
      setTimeout(() => {
        setActiveNotification((prev) => (prev + 1) % notifications.length);
        setIsVisible(true);
      }, 500);
    }, 4000); // Change notification every 4 seconds

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [notifications.length]);

  const activeMessage = notifications[activeNotification];

  return (
    <div className="ios-notification-container absolute inset-0 flex items-center justify-center pointer-events-none">
      <div
        className={`ios-notification ${
          isVisible 
            ? `animate-${animationDirection === 'up' ? 'fadeInUp' : 'fadeInDown'}` 
            : "opacity-0 transform " + 
              (animationDirection === 'up' ? "-translate-y-4" : "translate-y-4")
        } transition-all duration-500 ease-in-out w-[300px] max-w-[85%]`}
      >
        <div 
          className={`rounded-2xl shadow-lg backdrop-blur-lg ${
            isDarkMode 
              ? "bg-[#1A1F2C]/80 text-white border border-[#ffffff20]" 
              : "bg-[#ffffff]/80 text-[#333333] border border-[#00000010]"
          } p-3`}
        >
          <div className="flex items-start">
            {/* App icon using Digitaltskydd logo with blue background */}
            <div className="mr-3 mt-0.5">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-[#20a5fb]`}>
                <img 
                  src="/lovable-uploads/digitaltskydd-admin-logo.svg" 
                  alt="Digitaltskydd" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            {/* Notification content */}
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <span className="font-semibold text-sm">{activeMessage.title}</span>
                <span className="text-xs opacity-60">{activeMessage.time}</span>
              </div>
              <p className="text-sm mt-1">{activeMessage.body}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
