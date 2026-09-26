import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wasalha.app',
  appName: 'وصلها',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
