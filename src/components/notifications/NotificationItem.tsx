
import React from 'react';
import { formatDistanceToNow, parseISO } from "date-fns";
import { sv, enUS } from "date-fns/locale";
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { getStatusText } from '@/components/deindexing/utils/statusUtils';

interface NotificationItemProps {
  notification: {
    id: string;
    title: string;
    message: string;
    read: boolean;
    created_at: string;
    type?: string;
  };
  language: string;
  onMarkAsRead: (id: string) => void;
}

export const NotificationItem = ({ notification, language, onMarkAsRead }: NotificationItemProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

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

  const getTranslatedTitle = (type: string) => {
    if (type === 'guide_completion') {
      return t('guide.completion.needed');
    }
    if (type === 'removal') {
      return t('deindexing.status.notification.title');
    }
    if (type === 'monitoring_approval') {
      return language === 'sv' ? 'URL godkänd av användare' : 'URL approved by user';
    }
    return notification.title;
  };

  const getTranslatedMessage = (type: string) => {
    if (type === 'guide_completion') {
      const siteMatch = notification.message.match(/for (.+) to hide/);
      const siteName = siteMatch ? siteMatch[1] : '';
      return t('guide.completion.message', { site: siteName });
    }
    if (type === 'removal') {
      return t('deindexing.status.notification.message');
    }
    if (type === 'monitoring_approval') {
      return language === 'sv' 
        ? 'En bevaknings-URL godkändes av en användare och flyttades till länkhantering'
        : 'A monitoring URL was approved by a user and moved to link management';
    }
    return notification.message;
  };

  const handleClick = () => {
    onMarkAsRead(notification.id);
    
    if (notification.type === 'guide_completion') {
      navigate('/guides');
    } else if (notification.type === 'checklist') {
      navigate('/checklist');
    } else if (notification.type === 'address_alert') {
      navigate('/address-alerts');
    } else if (notification.type === 'removal') {
      navigate('/deindexing');
    } else if (notification.type === 'monitoring_approval') {
      navigate('/admin/deindexing');
    }
  };

  return (
    <div 
      className="flex items-start gap-2 w-full cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex-1">
        <p className={`text-sm font-medium ${
          notification.read 
            ? 'text-[#000000A6] dark:text-[#FFFFFFA6]' 
            : 'text-[#000000] dark:text-[#FFFFFF]'
        }`}>
          {getTranslatedTitle(notification.type || '')}
        </p>
        <p className={`text-xs mt-1 font-medium ${
          notification.read 
            ? 'text-[#000000A6] dark:text-[#FFFFFFA6]' 
            : 'text-[#000000] dark:text-[#FFFFFF]'
        }`}>
          {getTranslatedMessage(notification.type || '')}
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
