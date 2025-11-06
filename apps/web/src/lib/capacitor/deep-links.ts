/**
 * Deep Links & Universal Links Handler
 * Handles whatsfordinner:// and https://whatsfordinner.app/* links
 */

import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';

export interface DeepLinkData {
  path: string;
  params: Record<string, string>;
}

/**
 * Initialize deep link listener
 */
export function initDeepLinks(onLink: (data: DeepLinkData) => void) {
  // Handle app open from URL
  App.addListener('appUrlOpen', (event) => {
    const url = new URL(event.url);
    const data: DeepLinkData = {
      path: url.pathname,
      params: Object.fromEntries(url.searchParams.entries()),
    };
    onLink(data);
  });

  // Handle app state changes (when app is reopened via deep link)
  App.addListener('appStateChange', (state) => {
    if (state.isActive) {
      // App became active - check if opened via deep link
      // This is handled by appUrlOpen, but useful for logging
    }
  });
}

/**
 * Open external URL in in-app browser
 */
export async function openInAppBrowser(url: string): Promise<void> {
  try {
    await Browser.open({ url });
  } catch (error) {
    // Error handled: Failed to open browser:
    // Fallback to window.open in web
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  }
}

/**
 * Check if app was opened via deep link
 */
export async function getLaunchUrl(): Promise<string | null> {
  try {
    const { url } = await App.getLaunchUrl();
    return url || null;
  } catch (error) {
    return null;
  }
}

/**
 * Navigate to path from deep link
 */
export function navigateFromDeepLink(path: string, params?: Record<string, string>) {
  // Parse path and navigate
  // This should integrate with your router (Next.js router or similar)
  if (typeof window !== 'undefined') {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    const fullPath = queryString ? `${path}?${queryString}` : path;
    
    // Example for Next.js
    window.location.href = fullPath;
  }
}
