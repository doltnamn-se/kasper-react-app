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
        <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce-dot"></div>
        <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce-dot-delay-1"></div>
        <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce-dot-delay-2"></div>
      </div>
    </div>
  );
};