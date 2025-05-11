
import React, { useEffect, useState } from 'react';

interface TypingAnimationProps {
  fullText: string;
  isDarkMode?: boolean;
}

export const TypingAnimation: React.FC<TypingAnimationProps> = ({ fullText, isDarkMode }) => {
  const [displayText, setDisplayText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  
  useEffect(() => {
    // Reset the typing animation when text changes
    setDisplayText('');
    setIsTypingComplete(false);
    
    let i = 0;
    // Start typing animation with a slight delay
    const typingDelay = setTimeout(() => {
      const typingInterval = setInterval(() => {
        if (i < fullText.length) {
          setDisplayText(prev => prev + fullText.charAt(i));
          i++;
        } else {
          clearInterval(typingInterval);
          setIsTypingComplete(true);
        }
      }, 30); // Speed of typing (lower = faster)
      
      return () => clearInterval(typingInterval);
    }, 500); // Delay before typing starts
    
    return () => clearTimeout(typingDelay);
  }, [fullText]);

  return (
    <div className="mb-6 text-center px-4">
      <p className={`text-xl font-[500] ${
        isDarkMode ? "text-white" : "text-black"
      } typing-animation`}>
        {displayText}
        {!isTypingComplete && <span className="cursor-blink">|</span>}
      </p>
    </div>
  );
};
