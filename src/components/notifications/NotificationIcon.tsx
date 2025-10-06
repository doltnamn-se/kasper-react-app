import React from 'react';
import { Bell, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationIconProps {
  unreadCount: number;
}

export const NotificationIcon = ({ unreadCount }: NotificationIconProps) => {
  return (
    <div className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#e8e8e8] dark:bg-[#303032] items-center justify-center">
      {unreadCount > 0 ? (
        <>
          <BellRing className="w-4 h-4 text-[#000000A6] dark:text-[#FFFFFFA6]" />
          <div className="absolute -top-[0.025rem] -right-[0.025rem] h-2 w-2 rounded-full bg-[#2e77d0]" />
        </>
      ) : (
        <Bell className="w-4 h-4 text-[#000000A6] dark:text-[#FFFFFFA6]" />
      )}
    </div>
  );
};