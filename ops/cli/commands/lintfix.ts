/**
 * Lintfix command
 */

import { execSync } from 'child_process';

export async function runLintFix(options: { check?: boolean }) {
  console.log('🔧 Fixing linting issues...\n');

  try {
    if (options.check) {
      console.log('Checking linting issues...');
      execSync('pnpm lint', { stdio: 'inherit' });
    } else {
      console.log('Fixing linting issues...');
      execSync('pnpm lintfix', { stdio: 'inherit' });
      execSync('pnpm format', { stdio: 'inherit' });
    }

    console.log('\n✅ Linting complete!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Linting failed');
    process.exit(1);
  }
}
