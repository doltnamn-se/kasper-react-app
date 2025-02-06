import { MessageSquare, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLanguage } from "@/contexts/LanguageContext";
import { NotificationList } from "../notifications/NotificationList";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNotifications } from "@/hooks/useNotifications";

export const NotificationButtons = () => {
  const { t } = useLanguage();
  const { unreadCount } = useNotifications();

  const handleSupportClick = () => {
    window.open('https://doltnamn.se/support/', '_blank');
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleSupportClick}
            className="text-[#000000A6] hover:text-[#000000] dark:text-[#FFFFFFA6] dark:hover:text-[#FFFFFF] h-8 w-8 flex items-center justify-center hover:bg-transparent dark:hover:bg-transparent"
          >
            <MessageSquare className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('messages')}</p>
        </TooltipContent>
      </Tooltip>

      <Popover>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="relative text-[#000000A6] hover:text-[#000000] dark:text-[#FFFFFFA6] dark:hover:text-[#FFFFFF] h-8 w-8 flex items-center justify-center hover:bg-transparent dark:hover:bg-transparent"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-[#FF3B30] dark:bg-[#FF453A]" />
              )}
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <PopoverContent align="end" className="w-[380px] p-0">
          <NotificationList />
        </PopoverContent>
      </Popover>
    </>
  );
};