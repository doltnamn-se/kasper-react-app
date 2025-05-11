
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
      title: "Messages",
      body: "I'll see you bright and early tomorrow.",
      time: "now",
    },
    {
      id: 2,
      title: "Messages",
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
              className={`rounded-xl shadow-lg backdrop-blur-lg ${
                isDarkMode 
                  ? "bg-[#1A1F2C]/80 text-white border border-[#ffffff20]" 
                  : "bg-[#ffffff]/80 text-[#333333] border border-[#00000010]"
              } p-3`}
            >
              <div className="flex items-start">
                {/* App icon */}
                <div className="mr-3 mt-0.5">
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center overflow-hidden ${
                    notification.title === "Messages" ? "bg-green-500" : "bg-[#20a5fb]"
                  }`}>
                    {notification.title === "Messages" ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                        <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 00-1.032-.211 50.89 50.89 0 00-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 002.433 3.984L7.28 21.53A.75.75 0 016 21v-4.03a48.527 48.527 0 01-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979z" />
                        <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 001.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0015.75 7.5z" />
                      </svg>
                    ) : (
                      <img 
                        src="/lovable-uploads/digitaltskydd-admin-logo.svg" 
                        alt="Digitaltskydd" 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>
                
                {/* Notification content */}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-sm">{notification.title}</span>
                    <span className="text-xs opacity-60">{notification.time}</span>
                  </div>
                  <p className="text-sm mt-0.5">{notification.body}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
