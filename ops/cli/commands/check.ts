/**
 * Check command - run safety checks
 */

import { execSync } from 'child_process';

export async function runCheck(options: { type?: string }) {
  const type = options.type || 'all';
  console.log(`🔍 Running ${type} checks...\n`);

  const checks: Record<string, () => void> = {
    security: () => {
      console.log('🔒 Security Checks:');
      execSync('pnpm secrets:scan', { stdio: 'inherit' });
      execSync('pnpm security:audit', { stdio: 'inherit' });
      execSync('pnpm rls:test', { stdio: 'inherit' });
    },
    performance: () => {
      console.log('⚡ Performance Checks:');
      execSync('pnpm bundle:check', { stdio: 'inherit' });
      execSync('pnpm performance:budget', { stdio: 'inherit' });
    },
    compliance: () => {
      console.log('📋 Compliance Checks:');
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
    console.log('\n✅ All checks passed!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Some checks failed');
    process.exit(1);
  }
}
