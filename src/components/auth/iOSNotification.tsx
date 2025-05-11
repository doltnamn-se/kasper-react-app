
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
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [visibleNotifications, setVisibleNotifications] = useState<NotificationMessage[]>([]);
  const [animationDirection, setAnimationDirection] = useState<'up' | 'down'>('up');

  // Sample notifications data
  const notificationData: NotificationMessage[] = [
    {
      id: 1,
      title: "Digitaltskydd",
      body: "We've detected a new website with your information",
      time: "now",
    },
    {
      id: 2,
      title: "Digitaltskydd",
      body: "Your privacy score has improved by 15%",
      time: "now",
    },
    {
      id: 3,
      title: "Digitaltskydd",
      body: "3 websites have been successfully removed",
      time: "now",
    },
  ];

  useEffect(() => {
    // Initial animation delay before showing first notification
    const initialTimeout = setTimeout(() => {
      setNotifications([notificationData[0]]);
      setVisibleNotifications([notificationData[0]]);
    }, 1000);

    // Set up the notification sequence
    let currentIndex = 1;
    const interval = setInterval(() => {
      // Alternate animation direction for more visual interest
      setAnimationDirection(prev => prev === 'up' ? 'down' : 'up');
      
      if (currentIndex < notificationData.length) {
        // Add new notification to the stack
        const newNotification = notificationData[currentIndex];
        setNotifications(prev => [...prev, newNotification]);
        setVisibleNotifications(prev => [...prev, newNotification]);
        currentIndex++;
      } else {
        // Reset the notifications after showing all
        setVisibleNotifications([]);
        setTimeout(() => {
          setNotifications([]);
          currentIndex = 0;
          
          // Start over with a delay
          setTimeout(() => {
            setNotifications([notificationData[0]]);
            setVisibleNotifications([notificationData[0]]);
            currentIndex = 1;
          }, 500);
        }, 500);
      }
    }, 4000); // Change notification every 4 seconds

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="ios-notification-container absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="relative w-[300px] max-w-[85%]">
        {visibleNotifications.map((notification, index) => (
          <div
            key={notification.id}
            className={`ios-notification absolute left-0 right-0 
              ${index === 0 ? 'first-notification' : 'stacked-notification'} 
              ${index === visibleNotifications.length - 1 ? 'z-30' : `z-${20 - index}`}
              ${index === 0 && visibleNotifications.length === 1 ? 
                (animationDirection === 'up' ? 'animate-fadeInUp' : 'animate-fadeInDown') : ''}
              transition-all duration-300 ease-in-out`}
            style={{
              transform: `translateY(${index * 8}px)`,
              opacity: 1 - (index * 0.1)
            }}
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
                    <span className="font-semibold text-sm">{notification.title}</span>
                    <span className="text-xs opacity-60">{notification.time}</span>
                  </div>
                  <p className="text-sm mt-1">{notification.body}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
