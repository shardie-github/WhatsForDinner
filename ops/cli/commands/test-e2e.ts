/**
 * E2E test command
 */

import { execSync } from 'child_process';
import { createComponentLogger } from '@whats-for-dinner/utils';

const logger = createComponentLogger('test-e2e-ts');
export async function runE2E(options: { ui?: boolean; headed?: boolean; grep?: string }) {
  logger.info('🧪 Running E2E tests...\n');

  const args: string[] = [];

  if (options.ui) {
    args.push('--ui');
  }

  if (options.headed) {
    args.push('--headed');
  }

  if (options.grep) {
    args.push(`--grep`, options.grep);
  }

  try {
    // Run Playwright tests
    execSync(`npx playwright test ${args.join(' ')}`, {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    logger.info('\n✅ E2E tests passed!');
    process.exit(0);
  } catch (error) {
    logger.error('\n❌ E2E tests failed');
    process.exit(1);
  }
}
