import { SplashScreen } from '@capacitor/splash-screen';
import { isNativePlatform } from '@/capacitor';

/**
 * Handles splash screen display and hiding
 */
export const splashScreenService = {
  /**
   * Initializes the splash screen
   */
  initialize: async () => {
    if (isNativePlatform()) {
      // Keep splash screen visible until our animation completes
      SplashScreen.show({
        autoHide: false,
      });
    }
  },

  /**
   * Hides the splash screen
   */
  hide: async () => {
    if (isNativePlatform()) {
      await SplashScreen.hide();
    }
  }
};
