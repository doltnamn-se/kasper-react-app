import { useLocation } from "react-router-dom";
import { Notification } from "./useNotifications";

export const useNotificationFiltering = (notifications: Notification[] = []) => {
  const location = useLocation();

  const getFilteredNotifications = () => {
    console.log('Processing notifications for filtering');
    
    // Filter out step 4 address alerts but keep other address alerts
    const filtered = notifications.filter(n => {
      if (n.type === 'address_alert' && n.message?.includes('step 4')) {
        console.log('Filtering out step 4 address alert:', n);
        return false;
      }
      return true;
    });

    console.log('Filtered notifications:', filtered);

    return filtered;
  };

  const filteredNotifications = getFilteredNotifications();
  
  // Calculate total unread count from filtered notifications
  const totalUnreadCount = filteredNotifications.filter(n => !n.read).length;
  
  console.log('Total unread count after filtering:', totalUnreadCount);

  return {
    filteredNotifications,
    totalUnreadCount
  };
};
