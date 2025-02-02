import { useLocation } from "react-router-dom";
import { Notification } from "./useNotifications";

export const useNotificationFiltering = (notifications: Notification[] = []) => {
  const location = useLocation();

  const getFilteredNotifications = () => {
    console.log('Filtering notifications for route:', location.pathname);
    
    return notifications.filter(n => {
      // Filter out checklist notifications
      if (n.type === 'checklist') {
        console.log('Filtering out checklist notification:', n);
        return false;
      }

      switch (location.pathname) {
        case '/deindexing':
          console.log('Filtering for deindexing page - showing only removal notifications');
          return n.type === 'removal';
          
        case '/address-alerts':
          const isAddressAlert = n.type === 'address_alert';
          const isNotStep4 = !n.message?.includes('step 4');
          console.log('Filtering for address-alerts page:', { 
            notification: n,
            isAddressAlert,
            isNotStep4,
            willShow: isAddressAlert && isNotStep4
          });
          return isAddressAlert && isNotStep4;
          
        default:
          console.log('Filtering for other pages - showing all except removal notifications');
          return n.type !== 'removal';
      }
    });
  };

  const filteredNotifications = getFilteredNotifications();
  const totalUnreadCount = filteredNotifications.filter(n => !n.read).length;

  console.log('Filtered notifications:', filteredNotifications);
  console.log('Total unread count:', totalUnreadCount);

  return {
    filteredNotifications,
    totalUnreadCount
  };
};