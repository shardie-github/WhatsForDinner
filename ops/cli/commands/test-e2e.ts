/**
 * E2E test command
 */

import { execSync } from 'child_process';

export async function runE2E(options: { ui?: boolean; headed?: boolean; grep?: string }) {
  console.log('🧪 Running E2E tests...\n');

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
    console.log('\n✅ E2E tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ E2E tests failed');
    process.exit(1);
  }
}
