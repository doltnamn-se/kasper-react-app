import React, { useState, useEffect } from 'react';

interface TypingIndicatorProps {
  users: Array<{
    user_id: string;
    display_name: string;
    role: string;
  }>;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ users }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (users.length > 0) {
      setShouldRender(true);
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      setTimeout(() => setShouldRender(false), 200);
    }
  }, [users.length]);

  if (!shouldRender) return null;

  return (
    <div className={`flex justify-start px-4 py-2 typing-indicator-container ${isVisible ? 'typing-indicator-enter' : 'typing-indicator-exit'}`}>
      <div className="typing-indicator-bubble px-4 py-2 flex items-center gap-1 rounded-2xl rounded-bl-none">
        <div className="w-2 h-2 typing-dot-animated-1 rounded-full"></div>
        <div className="w-2 h-2 typing-dot-animated-2 rounded-full"></div>
        <div className="w-2 h-2 typing-dot-animated-3 rounded-full"></div>
      </div>
    </div>
  );
};