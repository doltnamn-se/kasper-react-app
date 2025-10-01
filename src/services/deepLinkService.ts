import { App } from '@capacitor/app';
import { isNativePlatform } from '@/capacitor';

export const initializeDeepLinking = (onDeepLink: (url: string) => void) => {
  if (!isNativePlatform()) return;

  // Handle app opened via deep link
  App.addListener('appUrlOpen', (data) => {
    console.log('Deep link opened:', data.url);
    onDeepLink(data.url);
  });
};

export const parseDeepLink = (url: string): { path: string; params: URLSearchParams } => {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    const params = urlObj.searchParams;
    return { path, params };
  } catch (error) {
    console.error('Error parsing deep link:', error);
    return { path: '/', params: new URLSearchParams() };
  }
};
