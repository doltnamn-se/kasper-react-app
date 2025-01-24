import React from 'react';
import { formatDistanceToNow, parseISO } from "date-fns";
import { sv, enUS } from "date-fns/locale";

interface NotificationItemProps {
  notification: {
    id: string;
    title: string;
    message: string;
    read: boolean;
    created_at: string;
  };
  language: string;
  onMarkAsRead: (id: string) => void;
}

export const NotificationItem = ({ notification, language, onMarkAsRead }: NotificationItemProps) => {
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = parseISO(timestamp);
      return formatDistanceToNow(date, { 
        addSuffix: true,
        locale: language === 'sv' ? sv : enUS 
      });
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return language === 'sv' ? 'Ogiltigt datum' : 'Invalid date';
    }
  };

  return (
    <div 
      className="flex items-start gap-2 w-full cursor-pointer"
      onClick={() => onMarkAsRead(notification.id)}
    >
      <div className="flex-1">
        <p className={`text-sm font-medium ${
          notification.read 
            ? 'text-[#000000A6] dark:text-[#FFFFFFA6]' 
            : 'text-[#000000] dark:text-[#FFFFFF]'
        }`}>
          {notification.title}
        </p>
        <p className={`text-xs mt-1 font-medium ${
          notification.read 
            ? 'text-[#000000A6] dark:text-[#FFFFFFA6]' 
            : 'text-[#000000] dark:text-[#FFFFFF]'
        }`}>
          {notification.message}
        </p>
        <p className={`text-xs mt-1 font-medium ${
          notification.read 
            ? 'text-[#000000A6] dark:text-[#FFFFFFA6]' 
            : 'text-[#000000] dark:text-[#FFFFFF]'
        }`}>
          {formatTimestamp(notification.created_at)}
        </p>
      </div>
      {!notification.read && (
        <div className="h-2 w-2 rounded-full bg-[#2e77d0] mt-2" />
      )}
    </div>
  );
};