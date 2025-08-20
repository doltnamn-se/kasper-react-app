import React from 'react';

interface TypingIndicatorProps {
  users: Array<{
    user_id: string;
    display_name: string;
    role: string;
  }>;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ users }) => {
  if (users.length === 0) return null;

  return (
    <div className="flex justify-start px-4 py-2">
      <div className="typing-indicator-bubble px-4 py-2 flex items-center gap-1 rounded-2xl rounded-bl-none">
        <div className="w-2 h-2 typing-dot-1 rounded-full"></div>
        <div className="w-2 h-2 typing-dot-2 rounded-full"></div>
        <div className="w-2 h-2 typing-dot-3 rounded-full"></div>
      </div>
    </div>
  );
};