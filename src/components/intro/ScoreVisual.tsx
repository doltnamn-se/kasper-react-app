import { useEffect, useState } from "react";

interface ScoreVisualProps {
  language: string;
}

export const ScoreVisual = ({ language }: ScoreVisualProps) => {
  const score = 100;
  const [displayScore, setDisplayScore] = useState(0);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    setDisplayScore(0);
    setAnimatedScore(0);
    
    const duration = 1000; // 1 second
    const steps = 60;
    const increment = score / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const newScore = Math.min(Math.round(increment * currentStep), score);
      setDisplayScore(newScore);
      setAnimatedScore(newScore);
      
      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, duration / steps);

    return () => {
      clearInterval(interval);
    };
  }, [score]);
  
  return (
    <div className="flex flex-col items-start gap-6 w-full bg-[#fbfbfb] dark:bg-[#1c1c1e] p-4 md:p-6 rounded-2xl shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
      {/* Score number */}
      <div className="flex flex-col items-start">
        <div className="text-6xl font-medium text-[#000000] dark:text-[#FFFFFF]">
          {displayScore}
        </div>
        <p className="text-[#000000A6] dark:text-[#FFFFFFA6] text-sm font-medium mt-1">
          {language === 'sv' ? 'Fullt skyddad' : 'Fully protected'}
        </p>
      </div>
      
      {/* Progress bar */}
      <div className="w-full">
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
            }}
            className="dark:bg-gradient-to-b dark:from-transparent dark:via-white/20 dark:to-white bg-gradient-to-b from-transparent via-black/20 to-black"
          />
        </div>
        <div className="relative w-full h-3 rounded-lg overflow-hidden">
          <div className="absolute inset-0 bg-[#e8e8e5] dark:bg-[#2f2e31]" />
          <div 
            className="absolute top-0 left-0 h-full rounded-r-lg relative overflow-hidden"
            style={{ 
              width: `${animatedScore}%`,
              background: `linear-gradient(90deg, 
                rgba(234, 56, 76, 1) 0%,
                rgb(249, 115, 22) 35%,
                rgba(251, 209, 4, 255) 70%,
                rgba(17, 84, 242, 255) 88%,
                rgba(25, 208, 91, 255) 100%
              )`,
            }}
          >
            {/* Animated liquid shimmer effect */}
            <div 
              className="absolute inset-0 animate-pulse"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                animation: 'shimmer 2s ease-in-out infinite',
              }}
            />
          </div>
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
          <span>0</span>
          <span>100</span>
        </div>
      </div>
    </div>
  );
};
