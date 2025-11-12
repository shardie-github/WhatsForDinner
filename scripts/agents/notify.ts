#!/usr/bin/env tsx
/**
 * Notification Agent
 * 
 * Sends notifications to Slack (if webhook configured) or prints to console.
 * 
 * Usage:
 *   tsx scripts/agents/notify.ts [--message="Custom message"]
 * 
 * Environment:
 *   SLACK_WEBHOOK_URL (optional) - Slack webhook URL
 */

import { logger } from '../lib/logger';

const WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const MESSAGE = process.argv.find((arg) => arg.startsWith('--message='))?.split('=')[1] || 'System notification';

async function notify() {
  logger.info('Sending notification...');

  if (WEBHOOK_URL) {
    try {
      // Send to Slack
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `[Self-Healing System] ${MESSAGE}`,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        logger.info('✅ Notification sent to Slack');
      } else {
        logger.warn(`⚠️  Slack notification failed: ${response.statusText}`);
        console.log(`[NOTIFICATION] ${MESSAGE}`);
      }
    } catch (error) {
      logger.warn(`⚠️  Slack notification error: ${(error as Error).message}`);
      console.log(`[NOTIFICATION] ${MESSAGE}`);
    }
  } else {
    // Print to console
    console.log(`[NOTIFICATION] ${MESSAGE}`);
    logger.info('Notification printed to console (SLACK_WEBHOOK_URL not set)');
  }
}

notify().catch((error) => {
  logger.error('Fatal error:', error);
  // Don't exit non-zero - notifications are non-critical
});
