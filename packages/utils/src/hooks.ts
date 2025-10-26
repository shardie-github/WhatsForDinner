import { useState, useEffect } from 'react';
import { useDeviceMode } from './device';

// Cross-platform hook for device detection
export function useDeviceInfo() {
  const deviceMode = useDeviceMode();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (deviceMode.isWeb) {
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [deviceMode.isWeb]);

  return {
    ...deviceMode,
    isOnline,
  };
}

// Hook for responsive values
export function useResponsiveValue<T>(
  mobile: T,
  tablet?: T,
  desktop?: T
): T {
  const { isWeb } = useDeviceMode();
  
  // In a real implementation, you'd use actual breakpoint detection
  // For now, return mobile for native, desktop for web
  return isWeb ? (desktop ?? tablet ?? mobile) : mobile;
}

// Hook for platform-specific styling
export function usePlatformStyles() {
  const { isIOS, isAndroid, isWeb } = useDeviceMode();

  return {
    safeAreaTop: isIOS ? 44 : isAndroid ? 24 : 0,
    safeAreaBottom: isIOS ? 34 : isAndroid ? 0 : 0,
    statusBarHeight: isIOS ? 44 : isAndroid ? 24 : 0,
    isWeb,
    isMobile: !isWeb,
  };
}

// Hook for pantry management
export function usePantry() {
  const [items, setItems] = useState<string[]>([]);

  const addItem = (item: string) => {
    setItems(prev => [...prev, item]);
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const clearItems = () => {
    setItems([]);
  };

  return {
    items,
    addItem,
    removeItem,
    clearItems,
  };
}