
import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export const HourlyCountdown = () => {
  const { language } = useLanguage();
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [dots, setDots] = useState('.');

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

      // If we've reached the interval point, trigger scanning state
      if (minutes === 0 && seconds === 0) {
        setIsScanning(true);
        setTimeout(() => {
          setIsScanning(false);
        }, 60000); // Reset after 1 minute
      }

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

  // Animate dots when scanning
  useEffect(() => {
    if (isScanning) {
      const dotsTimer = setInterval(() => {
        setDots(prev => {
          if (prev === '...') return '.';
          if (prev === '..') return '...';
          if (prev === '.') return '..';
          return '.';
        });
      }, 500); // Change dots every 500ms

      return () => clearInterval(dotsTimer);
    }
  }, [isScanning]);

  return (
    <div className="relative h-6">
      <span 
        className={`absolute text-sm font-medium text-[#000000A6] dark:text-[#FFFFFFA6] inline-flex transition-opacity duration-300 ${isScanning ? 'opacity-0' : 'opacity-100'}`}
      >
        {language === 'sv' ? 
          `${timeLeft} till nästa skan` : 
          `${timeLeft} until next scan`
        }
      </span>
      <span 
        className={`absolute text-sm font-medium text-[#000000A6] dark:text-[#FFFFFFA6] inline-flex transition-opacity duration-300 ${isScanning ? 'opacity-100' : 'opacity-0'}`}
      >
        <span className="min-w-fit">
          {language === 'sv' ? 'Skannar' : 'Scanning'}
        </span>
        <span className="w-[18px]">{dots}</span>
      </span>
    </div>
  );
};

