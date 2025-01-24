import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { NotificationItem } from "./NotificationItem";
import { useLanguage } from "@/contexts/LanguageContext";

interface NotificationListProps {
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    read: boolean;
    created_at: string;
  }>;
  onMarkAsRead: (id: string) => void;
}

export const NotificationList = ({ notifications, onMarkAsRead }: NotificationListProps) => {
  const { t, language } = useLanguage();

  return (
    <ScrollArea className="h-[300px] [&_*::-webkit-scrollbar-thumb]:bg-[#e0e0e0]">
      {notifications && notifications.length > 0 ? (
        notifications.map((notification) => (
          <DropdownMenuItem
            key={notification.id}
            className="px-4 py-2 cursor-pointer hover:bg-[#f3f4f6] dark:hover:bg-[#2d2d2d]"
          >
            <NotificationItem
              notification={notification}
              language={language}
              onMarkAsRead={onMarkAsRead}
            />
          </DropdownMenuItem>
        ))
      ) : (
        <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
          {t('notifications.empty')}
        </div>
      )}
    </ScrollArea>
  );
};