import 'dotenv/config';
import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: process.env.APP_NAME ?? 'HardoniaApp',
  slug: 'hardonia-app',
  version: '1.0.0',
  scheme: 'hardonia',
  orientation: 'portrait',
  icon: './assets/icon.png',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  ios: {
    bundleIdentifier: 'store.hardonia.app',
    supportsTablet: true
  },
  android: {
    package: 'store.hardonia.app',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    }
  },
  web: {
    bundler: 'metro'
  },
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    env: process.env.APP_ENV ?? 'development'
  },
  plugins: ['expo-router', 'expo-constants', 'expo-notifications']
};

export default config;
