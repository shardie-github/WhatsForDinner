#!/usr/bin/env node
/**
 * Master Orchestrator CLI
 * 
 * Commands:
 *   ops doctor           - Run all health checks
 *   ops init             - Initialize ops framework
 *   ops check            - Run validation checks
 *   ops release          - Release with semantic versioning
 *   ops snapshot         - Create database snapshot
 *   ops restore          - Restore database snapshot
 *   ops rotate-secrets   - Rotate all secrets
 *   ops sb-guard         - RLS audit and enforcement
 *   ops test:e2e         - Run E2E tests
 *   ops benchmark        - Performance benchmarks
 *   ops lintfix          - Auto-fix linting issues
 *   ops docs             - Generate documentation
 *   ops changelog        - Generate changelog
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const OPS_DIR = join(process.cwd(), 'ops');
const REPORTS_DIR = join(OPS_DIR, 'reports');
const RUNBOOKS_DIR = join(OPS_DIR, 'runbooks');
const SECRETS_DIR = join(OPS_DIR, 'secrets');

interface CheckResult {
  name: string;
  passed: boolean;
  message?: string;
  duration?: number;
}

class OpsCLI {
  private startTime: number = Date.now();

  async run() {
    const command = process.argv[2];
    const args = process.argv.slice(3);

    this.ensureDirs();

    switch (command) {
      case 'doctor':
        await this.doctor();
        break;
      case 'init':
        await this.init();
        break;
      case 'check':
        await this.check(args);
        break;
      case 'release':
        await this.release(args);
        break;
      case 'snapshot':
        await this.snapshot(args);
        break;
      case 'restore':
        await this.restore(args);
        break;
      case 'rotate-secrets':
        await this.rotateSecrets();
        break;
      case 'sb-guard':
        await this.sbGuard();
        break;
      case 'test:e2e':
        await this.testE2E(args);
        break;
      case 'benchmark':
        await this.benchmark(args);
        break;
      case 'lintfix':
        await this.lintfix();
        break;
      case 'docs':
        await this.docs();
        break;
      case 'changelog':
        await this.changelog(args);
        break;
      default:
        console.error(`Unknown command: ${command}`);
        this.printUsage();
        process.exit(1);
    }
  }

  private ensureDirs() {
    [REPORTS_DIR, RUNBOOKS_DIR, SECRETS_DIR].forEach(dir => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    });
  }

  private printUsage() {
      }

  async doctor(): Promise<void> {
        const checks: CheckResult[] = [];

    // Check 1: Dependencies
    checks.push(await this.runCheck('Dependencies', () => {
      execSync('pnpm install --frozen-lockfile', { stdio: 'pipe' });
    }));

    // Check 2: TypeScript
    checks.push(await this.runCheck('TypeScript', () => {
      execSync('pnpm type-check', { stdio: 'pipe' });
    }));

    // Check 3: Linting
    checks.push(await this.runCheck('Linting', () => {
      execSync('pnpm lint', { stdio: 'pipe' });
    }));

    // Check 4: Tests
    checks.push(await this.runCheck('Tests', () => {
      execSync('pnpm test', { stdio: 'pipe' });
    }));

    // Check 5: Build
    checks.push(await this.runCheck('Build', () => {
      execSync('pnpm build:packages', { stdio: 'pipe' });
    }));

    // Check 6: Secrets scan
    checks.push(await this.runCheck('Secrets Scan', () => {
      execSync('pnpm secrets:scan', { stdio: 'pipe' });
    }));

    // Check 7: RLS
    checks.push(await this.runCheck('RLS', () => {
      execSync('pnpm rls:test', { stdio: 'pipe' });
    }));

    // Check 8: Health check
    checks.push(await this.runCheck('Health Check', () => {
      execSync('pnpm health:check', { stdio: 'pipe' });
    }));

    // Check 9: Bundle size
    checks.push(await this.runCheck('Bundle Size', () => {
      execSync('pnpm bundle:check', { stdio: 'pipe' });
    }));

    // Check 10: Performance budgets
    checks.push(await this.runCheck('Performance Budgets', () => {
      execSync('pnpm performance:budget', { stdio: 'pipe' });
    }));

    // Summary
    const passed = checks.filter(c => c.passed).length;
    const failed = checks.filter(c => !c.passed).length;

                 - this.startTime) / 1000).toFixed(2)}s\n`);

    checks.forEach(check => {
      const icon = check.passed ? '✅' : '❌';
      const duration = check.duration ? ` (${check.duration}ms)` : '';
            if (!check.passed && check.message) {
              }
    });

    const report = {
      timestamp: new Date().toISOString(),
      checks,
      summary: { passed, failed, total: checks.length }
    };

    writeFileSync(
      join(REPORTS_DIR, 'doctor-report.json'),
      JSON.stringify(report, null, 2)
    );

    process.exit(failed > 0 ? 1 : 0);
  }

  private async runCheck(name: string, fn: () => void): Promise<CheckResult> {
    const start = Date.now();
    try {
      fn();
      return {
        name,
        passed: true,
        duration: Date.now() - start
      };
    } catch (error: any) {
      return {
        name,
        passed: false,
        message: error.message || 'Unknown error',
        duration: Date.now() - start
      };
    }
  }

  async init(): Promise<void> {
    
    // Create .env.example if it doesn't exist
    if (!existsSync('.env.example')) {
      const envExample = this.getEnvExample();
      writeFileSync('.env.example', envExample);
          }

    // Create .envrc if it doesn't exist
    if (!existsSync('.envrc')) {
      const envrc = 'use flake || true\n';
      writeFileSync('.envrc', envrc);
          }

    // Initialize secrets directory
    const secretsReadme = `# Secrets Management

This directory contains secret rotation scripts and templates.

DO NOT commit actual secrets to git.
`;
    writeFileSync(join(SECRETS_DIR, 'README.md'), secretsReadme);
    
      }

  private getEnvExample(): string {
    return `# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Vercel
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id

# Stripe (Test Mode)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Observability
SENTRY_DSN=your-sentry-dsn
SENTRY_ORG=your-sentry-org
SENTRY_PROJECT=your-sentry-project

# AI
OPENAI_API_KEY=sk-...

# Webhooks
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
SLACK_WEBHOOK_URL=https://hooks.slack.com/...

# Feature Flags
ENABLE_BILLING=false
ENABLE_QUIET_MODE=false
`;
  }

  async check(args: string[]): Promise<void> {
        await this.doctor();
  }

  async release(args: string[]): Promise<void> {
    
    // Run doctor first
        await this.doctor();

    // Generate changelog
    await this.changelog([]);

    // Run release
    const { release } = await import('./release-train');
    const type = args[0] as 'patch' | 'minor' | 'major' | undefined;
    const dryRun = args.includes('--dry-run');
    
    if (!type || !['patch', 'minor', 'major'].includes(type)) {
      console.error('Usage: ops release [patch|minor|major] [--dry-run]');
      process.exit(1);
    }

    await release({ type, dryRun });
  }

  async snapshot(args: string[]): Promise<void> {
        const { createSnapshot } = await import('./migration-safety');
    const metadata = await createSnapshot(args[0]);
      }

  async restore(args: string[]): Promise<void> {
        if (!args[0]) {
      console.error('Usage: ops restore <snapshot-id>');
      process.exit(1);
    }
    const { restoreSnapshot } = await import('./migration-safety');
    await restoreSnapshot(args[0]);
  }

  async rotateSecrets(): Promise<void> {
        const { rotateSecrets } = await import('./secrets/rotate');
    const rotations = await rotateSecrets();
      }

  async sbGuard(): Promise<void> {
        const { sbGuard } = await import('./rls-guard');
    await sbGuard();
  }

  async testE2E(args: string[]): Promise<void> {
        try {
      execSync('cd apps/web && npx playwright test tests/reality/e2e.spec.ts', { stdio: 'inherit' });
          } catch (error) {
      console.error('❌ E2E tests failed');
      process.exit(1);
    }
  }

  async benchmark(args: string[]): Promise<void> {
        try {
      execSync('pnpm perf:compare', { stdio: 'inherit' });
          } catch (error) {
      console.error('❌ Benchmarks failed');
      process.exit(1);
    }
  }

  async lintfix(): Promise<void> {
        try {
      execSync('pnpm lint:fix', { stdio: 'inherit' });
      execSync('pnpm format', { stdio: 'inherit' });
          } catch (error) {
      console.error('❌ Failed to fix linting issues');
      process.exit(1);
    }
  }

  async docs(): Promise<void> {
        const { generateDocs } = await import('./docs-generator');
    await generateDocs();
  }

  async changelog(args: string[]): Promise<void> {
        const { generateChangelog } = await import('./release-train');
    await generateChangelog();
  }
}

// Run CLI
new OpsCLI().run().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
