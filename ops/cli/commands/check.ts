/**
 * Check command - run safety checks
 */

import { execSync } from 'child_process';
import { createComponentLogger } from '@whats-for-dinner/utils';

const logger = createComponentLogger('check-ts');
export async function runCheck(options: { type?: string }) {
  const type = options.type || 'all';
  
  const checks: Record<string, () => void> = {
    security: () => {
            execSync('pnpm secrets:scan', { stdio: 'inherit' });
      execSync('pnpm security:audit', { stdio: 'inherit' });
      execSync('pnpm rls:test', { stdio: 'inherit' });
    },
    performance: () => {
            execSync('pnpm bundle:check', { stdio: 'inherit' });
      execSync('pnpm performance:budget', { stdio: 'inherit' });
    },
    compliance: () => {
            execSync('pnpm compliance:check', { stdio: 'inherit' });
      execSync('pnpm privacy:audit', { stdio: 'inherit' });
    },
    all: () => {
      checks.security();
      checks.performance();
      checks.compliance();
    },
  };

  try {
    checks[type]();
        process.exit(0);
  } catch (error) {
    logger.error('\n❌ Some checks failed');
    process.exit(1);
  }
}
