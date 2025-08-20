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

  const getTypingText = () => {
    if (users.length === 1) {
      return `${users[0].display_name} skriver...`;
    } else if (users.length === 2) {
      return `${users[0].display_name} och ${users[1].display_name} skriver...`;
    } else {
      return `${users[0].display_name} och ${users.length - 1} andra skriver...`;
    }
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse animation-delay-150"></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse animation-delay-300"></div>
      </div>
      <span className="text-xs">{getTypingText()}</span>
    </div>
  );
};