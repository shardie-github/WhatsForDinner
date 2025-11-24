/**
 * Sentry Edge Configuration
 * 
 * This file configures Sentry for Edge runtime (middleware, edge functions).
 */

import * as Sentry from '@sentry/nextjs';
import { initSentry } from './src/lib/sentry-config';

// Initialize Sentry for edge runtime
initSentry();

export default Sentry;
