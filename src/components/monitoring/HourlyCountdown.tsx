
import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export const HourlyCountdown = () => {
  const { language } = useLanguage();
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const nextInterval = new Date(now);
      const currentMinutes = nextInterval.getMinutes();
      const minutesUntilNext = 5 - (currentMinutes % 5);
      
      nextInterval.setMinutes(currentMinutes + minutesUntilNext);
      nextInterval.setSeconds(0);
      nextInterval.setMilliseconds(0);

      const diff = nextInterval.getTime() - now.getTime();
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <span className="text-sm font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
      {language === 'sv' ? 
        `${timeLeft} till nästa skan` : 
        `${timeLeft} until next scan`
      }
    </span>
  );
};

