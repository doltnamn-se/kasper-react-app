import { ScreenOrientation } from '@capacitor/screen-orientation';
import { Capacitor } from '@capacitor/core';

/**
 * Lock screen orientation to portrait mode on native mobile apps
 * This only works on iOS and Android, not in web browsers
 */
export const lockToPortrait = async () => {
  // Only apply on native platforms (iOS/Android)
  if (Capacitor.isNativePlatform()) {
    try {
      await ScreenOrientation.lock({ orientation: 'portrait' });
      console.log('Screen orientation locked to portrait');
    } catch (error) {
      console.warn('Could not lock screen orientation:', error);
    }
  }
};

/**
 * Unlock screen orientation (allow rotation)
 */
export const unlockOrientation = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      await ScreenOrientation.unlock();
      console.log('Screen orientation unlocked');
    } catch (error) {
      console.warn('Could not unlock screen orientation:', error);
    }
  }
};
