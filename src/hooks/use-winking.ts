
import { useState, useCallback } from 'react';

export const useWinking = () => {
  const [isWinking, setIsWinking] = useState(false);

  const handleWink = useCallback(() => {
    if (!isWinking) {
      setIsWinking(true);
      setTimeout(() => setIsWinking(false), 500); // Animation duration
    }
  }, [isWinking]);

  return { isWinking, handleWink };
};
