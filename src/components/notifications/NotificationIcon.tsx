import React from 'react';
import { Bell, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationIconProps {
  unreadCount: number;
}

export const NotificationIcon = ({ unreadCount }: NotificationIconProps) => {
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="relative text-[#000000A6] hover:text-[#000000] dark:text-[#FFFFFFA6] dark:hover:text-[#FFFFFF] h-8 w-8 flex items-center justify-center hover:bg-transparent"
    >
      {unreadCount > 0 ? (
        <>
          <BellRing className="w-4 h-4" />
          <div className="absolute -top-[0.025rem] -right-[0.025rem] h-2 w-2 rounded-full bg-[#2e77d0]" />
        </>
      ) : (
        <Bell className="w-4 h-4" />
      )}
    </Button>
  );
};