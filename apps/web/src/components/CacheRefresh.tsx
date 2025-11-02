'use client';

import { useState } from 'react';

export default function CacheRefresh() {
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleRefresh() {
    setRefreshing(true);
    setMessage(null);

    try {
      // Check if service worker is supported
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        
        // Send message to service worker to refresh cache
        registration.active?.postMessage({ type: 'CACHE_REFRESH' });

        // Unregister and re-register service worker
        await navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const reg of registrations) {
            reg.unregister();
          }
        });

        // Reload page to re-register service worker
        window.location.reload();
      } else {
        setMessage('Service Worker not supported');
      }
    } catch (error) {
      console.error('Cache refresh error:', error);
      setMessage('Failed to refresh cache');
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="p-4 border-t">
      <button
        onClick={handleRefresh}
        disabled={refreshing}
        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50 text-sm"
      >
        {refreshing ? 'Refreshing...' : 'Refresh App Cache'}
      </button>
      {message && (
        <p className="mt-2 text-sm text-gray-600">{message}</p>
      )}
    </div>
  );
}
