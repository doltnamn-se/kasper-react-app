
import { SplashScreen } from '@capacitor/splash-screen';
import { isNativePlatform } from '@/capacitor';

/**
 * Service to handle splash screen functionality
 */
export const splashScreenService = {
  /**
   * Hide the splash screen
   */
  hide: async () => {
    if (isNativePlatform()) {
      try {
        await SplashScreen.hide();
        console.log('Splash screen hidden');
      } catch (error) {
        console.error('Error hiding splash screen:', error);
      }
    }
  },

  /**
   * Show the splash screen with optional configuration
   */
  show: async (options?: { autoHide?: boolean; fadeOutDuration?: number }) => {
    if (isNativePlatform()) {
      try {
        await SplashScreen.show({
          autoHide: options?.autoHide,
          fadeOutDuration: options?.fadeOutDuration,
        });
        console.log('Splash screen shown');
      } catch (error) {
        console.error('Error showing splash screen:', error);
      }
    }
  }
};
