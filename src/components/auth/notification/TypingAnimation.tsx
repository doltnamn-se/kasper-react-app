
import React from 'react';
import { TypingAnimationProps } from './types';

export const TypingAnimation: React.FC<TypingAnimationProps> = ({
  fullText,
  showTitle,
  isDarkMode,
  displayText,
  isTypingComplete
}) => {
  return (
    <div className={`mt-24 text-center px-6 overflow-visible transition-opacity duration-500 ease-in-out ${showTitle ? 'opacity-100' : 'opacity-0'}`}>
      <p className={`text-xl font-[500] ${
        isDarkMode ? "text-white" : "text-black"
      } typing-animation`}>
        {displayText}
        {!isTypingComplete && <span className="cursor-blink">|</span>}
      </p>
    </div>
  );
};
