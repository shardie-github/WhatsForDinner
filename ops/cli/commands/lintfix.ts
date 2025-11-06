/**
 * Lintfix command
 */

import { execSync } from 'child_process';

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
    console.error('\n❌ Linting failed');
    process.exit(1);
  }
}
