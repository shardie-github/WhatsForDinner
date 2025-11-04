// Client-side fetch wrapper with CSRF token support
'use client';

/**
 * Fetch wrapper that automatically includes CSRF token
 */
export async function fetchWithCSRF(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Get CSRF token
  const csrfResponse = await fetch('/api/csrf-token');
  const { token } = await csrfResponse.json();

  // Add CSRF token to headers
  const headers = new Headers(options.headers);
  headers.set('x-csrf-token', token);

  // Make request with CSRF token
  return fetch(url, {
    ...options,
    headers,
  });
}
