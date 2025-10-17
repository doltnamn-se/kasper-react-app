import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.d9e386f94e5444ac91d892db773a7ddc',
  appName: 'kasper-react-app',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    url: 'https://d9e386f9-4e54-44ac-91d8-92db773a7ddc.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Keyboard: {
      resize: 'none'
    }
  }
};

export default config;
