/**
 * Sentry Client Configuration
 * 
 * This file configures Sentry for the client-side of the Next.js application.
 */

import * as Sentry from '@sentry/nextjs';
import { initSentry } from './src/lib/sentry-config';

// Initialize Sentry on client side
if (typeof window !== 'undefined') {
  initSentry();
}

export default Sentry;
