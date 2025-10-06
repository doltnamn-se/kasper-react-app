import React from 'react';
import { MessageSquareText } from "lucide-react";
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
      <div className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#e8e8e8] dark:bg-[#303032] items-center justify-center">
        <MessageSquareText className="w-4 h-4 text-[#000000A6] dark:text-[#FFFFFFA6]" />
        {unreadCount > 0 && (
          <div className="absolute -top-[0.025rem] -right-[0.025rem] h-2 w-2 rounded-full bg-[#2e77d0]" />
        )}
      </div>
    </Button>
  );
};