import { Browser } from '@capacitor/browser';
import { isNativePlatform } from '@/capacitor';

/**
 * Opens a URL in an in-app browser on mobile, or a new tab on web
 * This ensures links stay within the app on native platforms
 */
export const openUrl = async (url: string) => {
  if (!url) return;

  if (isNativePlatform()) {
    // Open in in-app browser on mobile
    await Browser.open({ 
      url,
      presentationStyle: 'popover',
      toolbarColor: '#ffffff'
    });
  } else {
    // Open in new tab on web
    window.open(url, '_blank');
  }
};

/**
 * Closes the in-app browser (only works on native platforms)
 */
export const closeBrowser = async () => {
  if (isNativePlatform()) {
    await Browser.close();
  }
};
