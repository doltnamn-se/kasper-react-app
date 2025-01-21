import { Bell, MessageSquare, Check } from "lucide-react";
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

export const NotificationButtons = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const handleMarkAsRead = async (notificationId: string) => {
    console.log('Marking notification as read:', notificationId);
    await markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    console.log('Marking all notifications as read');
    await markAllAsRead();
  };

  return (
    <>
      <Button variant="ghost" size="icon" className="text-[#5e5e5e] dark:text-gray-400 hover:bg-black/5 dark:hover:bg-[#232325] h-8 w-8">
        <MessageSquare className="w-4 h-4" />
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative text-[#5e5e5e] dark:text-gray-400 hover:bg-black/5 dark:hover:bg-[#232325] h-8 w-8">
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-80">
          <div className="flex items-center justify-between px-4 py-2">
            <h4 className="font-medium">Notifications</h4>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleMarkAllAsRead}
                className="h-8 text-xs"
              >
                Mark all as read
              </Button>
            )}
          </div>
          
          <DropdownMenuSeparator />
          
          <ScrollArea className="h-[300px]">
            {notifications && notifications.length > 0 ? (
              notifications.map((notification) => (
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
                No notifications
              </div>
            )}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};