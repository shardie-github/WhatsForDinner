import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

program
  .name('ops')
  .description('Self-operating production framework CLI')
  .version('1.0.0');

// Doctor command - comprehensive health check
program
  .command('doctor')
  .description('Run comprehensive system health checks')
  .option('--fix', 'Auto-fix issues where possible')
  .option('--verbose', 'Show detailed output')
  .action(async (options) => {
    const { runDoctor } = await import('./commands/doctor.js');
    await runDoctor(options);
  });

// Init command - initialize ops framework
program
  .command('init')
  .description('Initialize ops framework in repository')
  .option('--force', 'Overwrite existing config')
  .action(async (options) => {
    const { runInit } = await import('./commands/init.js');
    await runInit(options);
  });

// Check command - run all checks
program
  .command('check')
  .description('Run all safety checks')
  .option('--type <type>', 'Check type: security|performance|compliance|all', 'all')
  .action(async (options) => {
    const { runCheck } = await import('./commands/check.js');
    await runCheck(options);
  });

// Release command - semantic release
program
  .command('release')
  .description('Perform release with semantic versioning')
  .option('--dry-run', 'Dry run without actual release')
  .option('--skip-tests', 'Skip tests (not recommended)')
  .action(async (options) => {
    const { runRelease } = await import('./commands/release.js');
    await runRelease(options);
  });

// Snapshot command - database snapshot
program
  .command('snapshot')
  .description('Create database snapshot')
  .option('--encrypt', 'Encrypt snapshot')
  .option('--subset <tables>', 'Comma-separated table list')
  .action(async (options) => {
    const { runSnapshot } = await import('./commands/snapshot.js');
    await runSnapshot(options);
  });

// Restore command - restore from snapshot
program
  .command('restore')
  .description('Restore database from snapshot')
  .option('--snapshot <path>', 'Snapshot file path')
  .option('--dry-run', 'Dry run validation')
  .action(async (options) => {
    const { runRestore } = await import('./commands/restore.js');
    await runRestore(options);
  });

// Rotate secrets command
program
  .command('rotate-secrets')
  .description('Rotate secrets and keys')
  .option('--force', 'Force rotation even if not expired')
  .option('--dry-run', 'Dry run without actual rotation')
  .action(async (options) => {
    const { runRotateSecrets } = await import('./commands/rotate-secrets.js');
    await runRotateSecrets(options);
  });

// Supabase guard command - RLS enforcement
program
  .command('sb-guard')
  .description('Scan Supabase for RLS and security issues')
  .option('--fix', 'Auto-generate policies')
  .option('--audit-only', 'Generate audit report only')
  .action(async (options) => {
    const { runSbGuard } = await import('./commands/sb-guard.js');
    await runSbGuard(options);
  });

// E2E test command
program
  .command('test:e2e')
  .description('Run end-to-end tests')
  .option('--ui', 'Open Playwright UI')
  .option('--headed', 'Run in headed mode')
  .option('--grep <pattern>', 'Filter tests by pattern')
  .action(async (options) => {
    const { runE2E } = await import('./commands/test-e2e.js');
    await runE2E(options);
  });

// Benchmark command
program
  .command('benchmark')
  .description('Run performance benchmarks')
  .option('--save', 'Save results as baseline')
  .option('--compare', 'Compare with baseline')
  .action(async (options) => {
    const { runBenchmark } = await import('./commands/benchmark.js');
    await runBenchmark(options);
  });

// Lintfix command
program
  .command('lintfix')
  .description('Fix linting issues automatically')
  .option('--check', 'Check only, do not fix')
  .action(async (options) => {
    const { runLintFix } = await import('./commands/lintfix.js');
    await runLintFix(options);
  });

// Docs command
program
  .command('docs')
  .description('Generate documentation')
  .option('--rebuild', 'Rebuild all docs')
  .option('--watch', 'Watch mode')
  .action(async (options) => {
    const { runDocs } = await import('./commands/docs.js');
    await runDocs(options);
  });

// Changelog command
program
  .command('changelog')
  .description('Generate changelog from commits')
  .option('--version <version>', 'Version number')
  .option('--unreleased', 'Generate unreleased changelog')
  .action(async (options) => {
    const { runChangelog } = await import('./commands/changelog.js');
    await runChangelog(options);
  });

// Guardian audit command
program
  .command('guardian:audit')
  .description('Audit Guardian system integrity and compliance')
  .option('--verbose', 'Show detailed output')
  .action(async (options) => {
    const { runGuardianAudit } = await import('./commands/guardian-audit.js');
    await runGuardianAudit(options);
  });

// Guardian verify command
program
  .command('guardian:verify')
  .description('Verify Guardian ledger hash chain integrity')
  .option('--user-id <userId>', 'Verify specific user ledger')
  .action(async (options) => {
    const { runGuardianVerify } = await import('./commands/guardian-verify.js');
    await runGuardianVerify(options);
  });

program.parse(process.argv);
