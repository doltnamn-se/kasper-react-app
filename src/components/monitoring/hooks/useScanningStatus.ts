
import { useState, useEffect } from 'react';

export const useScanningStatus = () => {
  const [lastChecked, setLastChecked] = useState(new Date());
  const [isScanning, setIsScanning] = useState(false);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const now = new Date();
    const minutes = now.getMinutes();
    const currentInterval = minutes - (minutes % 5);
    
    const isInScanningPeriod = minutes % 5 === 0;
    setIsScanning(isInScanningPeriod);
    
    if (isInScanningPeriod) {
      const previousInterval = new Date(now);
      previousInterval.setMinutes(currentInterval - 5);
      previousInterval.setSeconds(0);
      previousInterval.setMilliseconds(0);
      setLastChecked(previousInterval);
    } else {
      const lastInterval = new Date(now);
      lastInterval.setMinutes(currentInterval);
      lastInterval.setSeconds(0);
      lastInterval.setMilliseconds(0);
      setLastChecked(lastInterval);
    }

    const interval = setInterval(() => {
      const newTime = new Date();
      const newMinutes = newTime.getMinutes();
      const newSeconds = newTime.getSeconds();
      
      const shouldBeScanningNow = newMinutes % 5 === 0;
      setIsScanning(shouldBeScanningNow);
      
      if (newMinutes % 5 === 1 && newSeconds === 0) {
        const lastInterval = new Date(newTime);
        lastInterval.setMinutes(newMinutes - 1);
        lastInterval.setSeconds(0);
        lastInterval.setMilliseconds(0);
        setLastChecked(lastInterval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isScanning) {
      let count = 0;
      const dotInterval = setInterval(() => {
        count = (count + 1) % 4;
        setDots('.'.repeat(count));
      }, 500);

      return () => clearInterval(dotInterval);
    } else {
      setDots('');
    }
  }, [isScanning]);

  return { lastChecked, isScanning, dots };
};
