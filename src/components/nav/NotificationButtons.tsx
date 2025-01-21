import { Bell, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/useNotifications";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const NotificationButtons = () => {
  const { notifications = [], unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { t } = useLanguage();

  const { data: checklistProgress } = useQuery({
    queryKey: ['checklist-progress-notifications'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;

      const { data, error } = await supabase
        .from('customer_checklist_progress')
        .select('*')
        .eq('customer_id', session.user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching checklist progress:', error);
        return null;
      }

      return data;
    }
  });

  const { data: checklistItems = [] } = useQuery({
    queryKey: ['checklist-items-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checklist_items')
        .select('*')
        .order('order_index');

      if (error) {
        console.error('Error fetching checklist items:', error);
        return [];
      }

      return data;
    }
  });

  // Generate notifications for incomplete checklist items
  const checklistNotifications = checklistItems.map((item, index) => {
    let isCompleted = false;
    if (checklistProgress) {
      switch (index) {
        case 0:
          isCompleted = checklistProgress.password_updated || false;
          break;
        case 1:
          isCompleted = (checklistProgress.selected_sites?.length || 0) > 0;
          break;
        case 2:
          isCompleted = (checklistProgress.removal_urls?.length || 0) > 0;
          break;
        case 3:
          isCompleted = !!(checklistProgress.address && checklistProgress.personal_number);
          break;
      }
    }

    return {
      id: `checklist-${item.id}`,
      title: `Checklist: ${item.title}`,
      message: isCompleted ? 'Completed' : 'Pending completion',
      read: isCompleted,
      created_at: new Date().toISOString(),
      type: 'checklist'
    };
  });

  const allNotifications = [...notifications, ...checklistNotifications];
  const totalUnreadCount = unreadCount + checklistNotifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (notificationId: string) => {
    if (notificationId.startsWith('checklist-')) {
      return; // Checklist notifications can't be marked as read manually
    }
    await markAsRead(notificationId);
  };

  return (
    <>
      <Button variant="ghost" size="icon" className="text-[#5e5e5e] dark:text-gray-400 hover:bg-black/5 dark:hover:bg-[#232325] h-8 w-8 pr-1">
        <MessageSquare className="w-4 h-4" />
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative text-[#5e5e5e] dark:text-gray-400 hover:bg-black/5 dark:hover:bg-[#232325] h-8 w-8 pr-1">
            <Bell className="w-4 h-4" />
            {totalUnreadCount > 0 && (
              <Badge 
                className="absolute -top-0.5 -right-0.5 h-4 w-5 p-0 flex items-center justify-center text-[10px] leading-none bg-badge-subscription-bg dark:bg-badge-subscription-bg-dark text-[#001400] border-0 hover:bg-badge-subscription-bg dark:hover:bg-badge-subscription-bg-dark"
              >
                {totalUnreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-80">
          <div className="flex items-center justify-between px-4 py-2">
            <h4 className="font-medium">{t('notifications.title')}</h4>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="h-8 text-xs"
              >
                {t('notifications.mark.all.read')}
              </Button>
            )}
          </div>
          
          <DropdownMenuSeparator />
          
          <ScrollArea className="h-[300px]">
            {allNotifications && allNotifications.length > 0 ? (
              allNotifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="px-4 py-2 cursor-pointer"
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-start gap-2 w-full">
                    <div className={`flex-1 ${!notification.read ? 'font-medium' : ''}`}>
                      <p className="text-sm">{notification.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
                    )}
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                {t('notifications.empty')}
              </div>
            )}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
