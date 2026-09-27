import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wasalha.app',
  appName: 'وصلها',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    GoogleAuth: {
      // IMPORTANT: replace with the "Web client (auto created by Google Service)" OAuth
      // client ID from Firebase Console > Project settings > General > Your apps,
      // (or Google Cloud Console > APIs & Services > Credentials). This is NOT the
      // Android client ID — it must be the Web one, used as the server/audience id.
      scopes: ['profile', 'email'],
      serverClientId: 'REPLACE_WITH_YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
