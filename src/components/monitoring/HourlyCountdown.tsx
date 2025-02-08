
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

      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Check if we're in a scanning period (first minute of any 5-minute interval)
    const checkScanningPeriod = () => {
      const now = new Date();
      const currentMinutes = now.getMinutes();
      const currentSeconds = now.getSeconds();
      return currentMinutes % 5 === 0 && currentSeconds < 60;
    };

    // Initial state check
    const initialIsScanning = checkScanningPeriod();
    setIsScanning(initialIsScanning);
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
      setIsScanning(checkScanningPeriod());
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
      }, 500);

      return () => clearInterval(dotsTimer);
    }
  }, [isScanning]);

  if (isScanning) {
    return (
      <span className="text-sm font-medium text-[#000000A6] dark:text-[#FFFFFFA6] inline-flex">
        <span className="min-w-fit">
          {language === 'sv' ? 'Skannar' : 'Scanning'}
        </span>
        <span className="w-[18px]">{dots}</span>
      </span>
    );
  }

  return (
    <span className="text-sm font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
      {language === 'sv' ? 
        `${timeLeft} till nästa skan` : 
        `${timeLeft} until next scan`
      }
    </span>
  );
};
