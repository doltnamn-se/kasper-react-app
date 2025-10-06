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
      <div className={`relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full items-center justify-center ${
        unreadCount > 0 
          ? 'bg-[#d4f5bc] border border-[#d4f5bc]' 
          : 'bg-[#ffffff] dark:bg-[#1c1c1e] border border-[#e5e7eb] dark:border-[#232325]'
      }`}>
        {unreadCount > 0 ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#24cc5c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="9" y1="10" x2="15" y2="10" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
            <line x1="9" y1="14" x2="15" y2="14" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        ) : (
          <MessageSquareText className="w-4 h-4 text-[#000000A6] dark:text-[#FFFFFFA6]" />
        )}
      </div>
    </Button>
  );
};