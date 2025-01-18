import { Bell, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export const NotificationButtons = () => {
  return (
    <>
      <Button variant="ghost" size="icon" className="text-[#5e5e5e] dark:text-gray-400 hover:bg-black/5 dark:hover:bg-[#232325] h-8 w-8">
        <MessageSquare className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="icon" className="text-[#5e5e5e] dark:text-gray-400 hover:bg-black/5 dark:hover:bg-[#232325] h-8 w-8">
        <Bell className="w-4 h-4" />
      </Button>
    </>
  );
};