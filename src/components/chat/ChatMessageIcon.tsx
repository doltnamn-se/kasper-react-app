import React from 'react';
import { MessageSquareText, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatMessageIconProps {
  unreadCount: number;
  onClick: () => void;
}

export const ChatMessageIcon = ({ unreadCount, onClick }: ChatMessageIconProps) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative h-8 w-8 p-0 hover:bg-transparent"
      onClick={onClick}
    >
      <div className={`relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full items-center justify-center ${
        unreadCount > 0 
          ? 'bg-[#d4f5bc] dark:bg-[#054101] border border-[#d4f5bc] dark:border-[#054101]' 
          : 'bg-[#ffffff] dark:bg-[#1c1c1e] border border-[#e5e7eb] dark:border-[#232325]'
      }`}>
        {unreadCount > 0 ? (
          <MessageCircle className="w-4 h-4 text-[#24cc5c]" fill="#24cc5c" />
        ) : (
          <MessageSquareText className="w-4 h-4 text-[#000000A6] dark:text-[#FFFFFFA6]" />
        )}
      </div>
    </Button>
  );
};