'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to get CSRF token for forms
 */
export function useCSRFToken() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    async function fetchToken() {
      try {
        const response = await fetch('/api/csrf-token');
        if (response.ok) {
          const data = await response.json();
          setToken(data.token);
        }
      } catch (error) {
        // Error handled: Error fetching CSRF token:
      }
    }

    fetchToken();
  }, []);

  return token;
}

/**
 * CSRF Token Input Component
 */
export function CSRFTokenInput() {
  const token = useCSRFToken();

  if (!token) return null;

  return <input type="hidden" name="csrf_token" value={token} />;
}
