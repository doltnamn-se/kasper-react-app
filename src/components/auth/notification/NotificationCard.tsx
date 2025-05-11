
import React from 'react';
import { NotificationCardProps } from './types';

export const NotificationCard: React.FC<NotificationCardProps> = ({
  currentNotification,
  isDarkMode,
  isChangingText,
  notificationHeight,
  contentRef,
  showNotification
}) => {
  if (!showNotification) return null;

  return (
    <div className="ios-notification absolute left-0 right-0 animate-fadeInUp">
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
          {/* App icon container - Top alignment preserved */}
          <div className="mr-3 flex-shrink-0 pt-0.5">
            <div className="w-8 h-8 rounded-md flex items-center justify-center overflow-hidden bg-[#20a5fb]">
              <img 
                src="/lovable-uploads/digitaltskydd-admin-logo.svg" 
                alt="Digitaltskydd" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          {/* Notification content with animation */}
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
            
            {/* Heading with animation */}
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
  );
};
