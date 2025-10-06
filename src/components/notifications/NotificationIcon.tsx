import React from 'react';
import { Bell, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationIconProps {
  unreadCount: number;
}

export const NotificationIcon = ({ unreadCount }: NotificationIconProps) => {
  return (
    <div className={`relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full items-center justify-center ${
      unreadCount > 0 
        ? 'bg-[#d0ecfb] dark:bg-[#0d2754] border border-[#d0ecfb] dark:border-[#0d2754]' 
        : 'bg-[#ffffff] dark:bg-[#1c1c1e] border border-[#e5e7eb] dark:border-[#232325]'
    }`}>
      {unreadCount > 0 ? (
        <BellRing className="w-4 h-4 text-[#50bffb]" fill="#50bffb" />
      ) : (
        <Bell className="w-4 h-4 text-[#121212] dark:text-[#ffffff]" />
      )}
    </div>
  );
};