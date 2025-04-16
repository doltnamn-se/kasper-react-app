
import React from 'react';

interface ProgressBarProps {
  animatedScore: number;
  score: number;
}

export const ProgressBar = ({ animatedScore, score }: ProgressBarProps) => {
  return (
    <div className="flex-1">
      <div className="relative mb-2">
        <div 
          style={{ 
            left: `${animatedScore}%`,
            transform: 'translateX(-50%)',
            clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
            width: '3.5px',
            height: '2.5rem',
            borderRadius: '5px',
            position: 'absolute',
            bottom: '5px',
            transition: 'left 1000ms ease-out',
          }}
          className="dark:bg-gradient-to-b dark:from-transparent dark:via-white/20 dark:to-white bg-gradient-to-b from-transparent via-black/20 to-black"
        />
      </div>
      <div className="relative w-full h-3 rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-[#e8e8e5] dark:bg-[#2f2e31]" />
        <div 
          className="absolute top-0 left-0 h-full transition-all rounded-r-lg"
          style={{ 
            width: `${animatedScore}%`,
            background: `linear-gradient(90deg, 
              rgba(234, 56, 76, 1) 0%,
              rgb(249, 115, 22) 35%,
              rgba(251, 209, 4, 255) 70%,
              rgba(17, 84, 242, 255) 88%,
              rgba(25, 208, 91, 255) 100%
            )`,
            backgroundSize: `${100 / (score / 100)}% 100%`,
            transition: 'width 1000ms ease-out'
          }} 
        />
      </div>
      <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
        <span>0</span>
        <span>100</span>
      </div>
    </div>
  );
};
