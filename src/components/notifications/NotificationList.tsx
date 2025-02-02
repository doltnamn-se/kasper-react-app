import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { NotificationItem } from "./NotificationItem";
import { useLanguage } from "@/contexts/LanguageContext";

interface NotificationListProps {
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    read: boolean;
    created_at: string;
    type?: string;
  }>;
  onMarkAsRead: (id: string) => void;
}

export const NotificationList = ({ notifications, onMarkAsRead }: NotificationListProps) => {
  const { t, language } = useLanguage();

  // Filter out checklist notifications
  const filteredNotifications = notifications.filter(
    notification => !notification.id.startsWith('checklist-') && notification.type !== 'checklist'
  );

  console.log('Filtered notifications:', filteredNotifications);

  return (
    <ScrollArea className="h-[300px] [&_*::-webkit-scrollbar-thumb]:!bg-[#e0e0e0]">
      {filteredNotifications && filteredNotifications.length > 0 ? (
        filteredNotifications.map((notification, index) => (
          <React.Fragment key={notification.id}>
            <DropdownMenuItem
              className="px-4 py-2 cursor-pointer hover:!bg-[#f3f4f6] dark:hover:!bg-[#2d2d2d]"
            >
              <NotificationItem
                notification={notification}
                language={language}
                onMarkAsRead={onMarkAsRead}
              />
            </DropdownMenuItem>
            {index < filteredNotifications.length - 1 && (
              <DropdownMenuSeparator className="dark:border-[#232325]" />
            )}
          </React.Fragment>
        ))
      ) : (
        <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
          {t('notifications.empty')}
        </div>
      )}
    </ScrollArea>
  );
};