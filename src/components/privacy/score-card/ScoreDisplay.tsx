
import React, { useEffect, useState } from 'react';
import { cn } from "@/lib/utils";
import { ProgressBar } from './ProgressBar';

interface ScoreDisplayProps {
  score: number;
  language: string;
  isAuthLoop?: boolean;
}

export const ScoreDisplay = ({ score, language, isAuthLoop = false }: ScoreDisplayProps) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    // Reset animations
    setAnimatedScore(0);
    setDisplayScore(0);

    if (isAuthLoop) {
      // For auth pages - continuous animation loop
      let direction = 1; // 1 for increasing, -1 for decreasing
      let currentValue = 20; // Start from a lower value
      
      const interval = setInterval(() => {
        // Change direction when reaching limits
        if (currentValue >= 95) direction = -1;
        if (currentValue <= 20) direction = 1;
        
        // Update the score with small random increments to make it feel more natural
        const increment = (Math.random() * 1.5 + 0.5) * direction;
        currentValue = Math.max(20, Math.min(95, currentValue + increment));
        
        setDisplayScore(Math.round(currentValue));
        setAnimatedScore(Math.round(currentValue));
      }, 300); // Update every 300ms
      
      return () => clearInterval(interval);
    } else {
      // Standard animation for non-auth pages
      const duration = 1000; // 1 second
      const steps = 60; // 60 steps for smooth animation
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
    }
  }, [score, isAuthLoop]);

  const getProtectionLevel = (score: number) => {
    if (score === 100) return language === 'sv' ? "Fullt skyddad" : "Fully protected";
    if (score >= 90) return language === 'sv' ? "Säkert skydd" : "Safe protection";
    if (score >= 75) return language === 'sv' ? "Bra skydd" : "Good protection";
    if (score >= 50) return language === 'sv' ? "Hyfsat skydd" : "Decent protection";
    if (score >= 25) return language === 'sv' ? "Dåligt skydd" : "Poor protection";
    return language === 'sv' ? "Inget skydd" : "No protection";
  };

  return (
    <div className="space-y-0">
      <span className={cn("text-6xl font-medium text-[#000000] dark:text-[#FFFFFF]")}>
        {displayScore}
      </span>
      <p className="text-[#000000A6] dark:text-[#FFFFFFA6] text-sm font-medium" style={{ marginBottom: '50px', marginTop: '5px' }}>
        {getProtectionLevel(isAuthLoop ? displayScore : score)}
      </p>
      <ProgressBar animatedScore={animatedScore} score={isAuthLoop ? 100 : score} />
    </div>
  );
};
