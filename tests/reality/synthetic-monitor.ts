/**
 * Synthetic Monitor - Runs hourly in CI
 * 
 * Monitors production endpoints and sends alerts on failure
 */

import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import { createComponentLogger } from '@whats-for-dinner/utils';

const logger = createComponentLogger('synthetic-monitor-ts');
const PROD_URL = process.env.PROD_URL || 'https://whats-for-dinner.vercel.app';
const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK_URL;
const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL;

interface MonitorResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
}

async function sendAlert(webhookUrl: string, message: string) {
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message })
    });
  } catch (error) {
    logger.error('Failed to send alert:', { error });
  }
}

async function monitor(): Promise<MonitorResult[]> {
  const results: MonitorResult[] = [];
  const browser = await chromium.launch();

  // Monitor 1: Health endpoint
  const start1 = Date.now();
  try {
    const response = await fetch(`${PROD_URL}/api/health`);
    if (!response.ok) throw new Error(`Health check failed: ${response.status}`);
    results.push({
      name: 'Health Endpoint',
      passed: true,
      duration: Date.now() - start1
    });
  } catch (error: any) {
    results.push({
      name: 'Health Endpoint',
      passed: false,
      duration: Date.now() - start1,
      error: error.message
    });
  }

  // Monitor 2: Critical page load
  const start2 = Date.now();
  try {
    const page = await browser.newPage();
    await page.goto(PROD_URL, { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    results.push({
      name: 'Homepage Load',
      passed: true,
      duration: Date.now() - start2
    });
    await page.close();
  } catch (error: any) {
    results.push({
      name: 'Homepage Load',
      passed: false,
      duration: Date.now() - start2,
      error: error.message
    });
  }

  await browser.close();

  // Send alerts for failures
  const failures = results.filter(r => !r.passed);
  if (failures.length > 0) {
    const message = `🚨 Production Monitor Alert\n\n${failures.map(f => 
      `❌ ${f.name}: ${f.error}`
    ).join('\n')}`;
    
    if (DISCORD_WEBHOOK) await sendAlert(DISCORD_WEBHOOK, message);
    if (SLACK_WEBHOOK) await sendAlert(SLACK_WEBHOOK, message);
  }

  return results;
}

if (require.main === module) {
  monitor().then(results => {
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    logger.info('✅ Passed: ${passed}', { ❌ Failed: ${failed}` });
    process.exit(failed > 0 ? 1 : 0);
  });
}

export { monitor };
