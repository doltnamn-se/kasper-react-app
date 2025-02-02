import { useLocation } from "react-router-dom";
import { Notification } from "./useNotifications";

export const useNotificationFiltering = (notifications: Notification[] = []) => {
  const location = useLocation();

  const getFilteredNotifications = () => {
    console.log('Processing notifications, current route:', location.pathname);
    console.log('All notifications before filtering:', notifications.map(n => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      read: n.read
    })));
    
    // Only filter out checklist notifications, show all other types
    const filtered = notifications.filter(n => {
      if (n.type === 'checklist') {
        console.log('Filtering out checklist notification:', n);
        return false;
      }
      
      // For address alerts, still filter out step 4 notifications
      if (n.type === 'address_alert' && n.message?.includes('step 4')) {
        console.log('Filtering out step 4 address alert:', n);
        return false;
      }

      return true;
    });

    console.log('Notifications after filtering:', filtered.map(n => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      read: n.read
    })));

    return filtered;
  };

  // Calculate total unread count from all notifications (except checklist)
  const totalUnreadCount = notifications
    .filter(n => n.type !== 'checklist' && !n.read)
    .length;
  
  console.log('All unread notifications count:', totalUnreadCount);

  const filteredNotifications = getFilteredNotifications();

  return {
    filteredNotifications,
    totalUnreadCount
  };
};