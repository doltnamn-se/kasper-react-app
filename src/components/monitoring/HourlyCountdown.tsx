
import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export const HourlyCountdown = () => {
  const { language } = useLanguage();
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const nextHour = new Date(now);
      nextHour.setHours(nextHour.getHours() + 1);
      nextHour.setMinutes(0);
      nextHour.setSeconds(0);
      nextHour.setMilliseconds(0);

      const diff = nextHour.getTime() - now.getTime();
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
    <span className="text-sm text-[#4c4c4c] dark:text-[#67676c]">
      {language === 'sv' ? 
        `Nästa skan om ${timeLeft}` : 
        `Next scan in ${timeLeft}`
      }
    </span>
  );
};
