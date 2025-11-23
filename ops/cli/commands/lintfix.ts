/**
 * Lintfix command
 */

import { execSync } from 'child_process';
import { createComponentLogger } from '@whats-for-dinner/utils';

const logger = createComponentLogger('lintfix-ts');
export async function runLintFix(options: { check?: boolean }) {
  
  try {
    if (options.check) {
            execSync('pnpm lint', { stdio: 'inherit' });
    } else {
            execSync('pnpm lintfix', { stdio: 'inherit' });
      execSync('pnpm format', { stdio: 'inherit' });
    }

        process.exit(0);
  } catch (error) {
    logger.error('\n❌ Linting failed');
    process.exit(1);
  }
}
