
import React, { useRef, useState, useEffect } from 'react';
import { NotificationMessage } from './NotificationTypes';

interface NotificationCardProps {
  notification: NotificationMessage;
  isDarkMode?: boolean;
  isChangingText: boolean;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({ 
  notification, 
  isDarkMode = false,
  isChangingText 
}) => {
  const [notificationHeight, setNotificationHeight] = useState<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Measure height after content change
    if (contentRef.current) {
      setNotificationHeight(contentRef.current.offsetHeight);
    }
  }, [notification]);

  return (
    <div 
      className={`notification-card rounded-xl shadow-lg backdrop-blur-lg ${
        isDarkMode 
          ? "bg-[#1A1F2C]/80 text-white border border-[#ffffff20]" 
          : "bg-[#ffffff]/80 text-[#333333] border border-[#00000010]"
      } p-3`}
      style={{
        height: notificationHeight ? `${notificationHeight + 24}px` : 'auto',
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
              {notification.title}
            </span>
            <span className="text-xs opacity-60">
              {notification.time}
            </span>
          </div>
          
          {/* Updated heading with the same animation as body text */}
          <h3 className={`font-semibold text-sm mt-1 ${isChangingText ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'} transition-opacity transition-transform duration-300 ease-in-out`}>
            {notification.heading}
          </h3>
          
          <p className={`text-sm mt-0.5 notification-body ${isChangingText ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'}`}>
            {notification.body}
          </p>
        </div>
      </div>
    </div>
  );
};
