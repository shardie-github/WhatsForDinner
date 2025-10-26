import { Platform } from 'react-native';

export const isWeb = Platform.OS === 'web';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

export function useDeviceMode() {
  return {
    isWeb,
    isIOS,
    isAndroid,
    platform: Platform.OS,
  };
}

export function getResponsiveValue<T>(
  mobile: T,
  tablet?: T,
  desktop?: T
): T {
  // This would be implemented with actual responsive detection
  // For now, return mobile value
  return mobile;
}

export function getPlatformValue<T>(web: T, mobile: T): T {
  return isWeb ? web : mobile;
}