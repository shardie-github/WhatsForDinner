/**
 * Sentry Server Configuration
 * 
 * This file configures Sentry for the server-side of the Next.js application.
 */

import * as Sentry from '@sentry/nextjs';
import { initSentry } from './src/lib/sentry-config';

// Initialize Sentry on server side
initSentry();

export default Sentry;
