/**
 * Push Notifications Setup
 * Handles FCM (Android) and APNs (iOS) registration
 */

import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

export interface PushToken {
  value: string;
  platform: 'ios' | 'android';
}

let pushToken: PushToken | null = null;

/**
 * Request push notification permissions
 */
export async function requestPushPermission(): Promise<boolean> {
  try {
    const result = await PushNotifications.requestPermissions();
    return result.receive === 'granted';
  } catch (error) {
    // Error handled: Failed to request push permissions:
    return false;
  }
}

/**
 * Initialize push notifications
 */
export async function initPushNotifications(
  onToken: (token: PushToken) => void,
  onNotification: (notification: any) => void,
  onAction: (action: any) => void
): Promise<void> {
  // Check if push notifications are available
  if (!Capacitor.isNativePlatform()) {
        return;
  }

  try {
    // Register for push
    await PushNotifications.register();

    // Handle registration
    PushNotifications.addListener('registration', (token) => {
      pushToken = {
        value: token.value,
        platform: Capacitor.getPlatform() as 'ios' | 'android',
      };
            onToken(pushToken);
      
      // Send token to backend
      sendTokenToBackend(pushToken);
    });

    // Handle registration errors
    PushNotifications.addListener('registrationError', (error) => {
      // Error handled: Push registration error:
    });

    // Handle notification received
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
            onNotification(notification);
    });

    // Handle notification action (tap)
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
            onAction(action);
    });
  } catch (error) {
    // Error handled: Failed to initialize push notifications:
  }
}

/**
 * Send push token to backend
 */
async function sendTokenToBackend(token: PushToken) {
  try {
    const response = await fetch('/api/push/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: token.value,
        platform: token.platform,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to register token');
    }
  } catch (error) {
    // Error handled: Failed to send token to backend:
  }
}

/**
 * Get current push token
 */
export function getPushToken(): PushToken | null {
  return pushToken;
}

/**
 * Unregister from push notifications
 */
export async function unregisterPushNotifications(): Promise<void> {
  try {
    await PushNotifications.unregister();
    pushToken = null;
  } catch (error) {
    // Error handled: Failed to unregister push notifications:
  }
}
