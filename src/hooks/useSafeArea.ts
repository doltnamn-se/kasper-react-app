import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { SafeArea } from 'capacitor-plugin-safe-area';

interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export const useSafeArea = () => {
  const [insets, setInsets] = useState<SafeAreaInsets>({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  });

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const getSafeAreaInsets = async () => {
      try {
        const safeAreaData = await SafeArea.getSafeAreaInsets();
        setInsets(safeAreaData.insets);
      } catch (error) {
        console.error('Failed to get safe area insets:', error);
      }
    };

    getSafeAreaInsets();
  }, []);

  return insets;
};
