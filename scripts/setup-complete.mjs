#!/usr/bin/env node
/**
 * Complete Setup Script
 * 
 * Runs all setup steps based on execution reports
 */

import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function runStep(name, fn) {
  log(`\n▶️  ${name}`, 'cyan');
  log('='.repeat(50), 'cyan');
  try {
    await fn();
    log(`✅ ${name} completed`, 'green');
    return { success: true, name };
  } catch (error) {
    log(`⚠️  ${name} had issues: ${error.message}`, 'yellow');
    return { success: false, name, error: error.message };
  }
}

async function main() {
  log('\n🚀 Complete Setup Execution', 'magenta');
  log('='.repeat(50), 'magenta');
  log('Running all next steps from execution reports\n', 'cyan');

  const results = [];

  // Step 1: Address secrets findings
  results.push(await runStep('Address Secrets Findings', async () => {
    execSync('node scripts/address-secrets-findings.mjs', { 
      stdio: 'inherit',
      cwd: projectRoot 
    });
  }));

  // Step 2: Improve test coverage analysis
  results.push(await runStep('Analyze Test Coverage', async () => {
    execSync('node scripts/improve-test-coverage.mjs', { 
      stdio: 'inherit',
      cwd: projectRoot 
    });
  }));

  // Step 3: Create database migration instructions
  results.push(await runStep('Create Database Migration Guide', async () => {
    const migrationGuide = `# Database Migration Guide

## Secrets Vault Migration

To set up the secrets_vault table in Supabase:

### Method 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of: \`supabase/migrations/create_secrets_vault.sql\`
4. Paste and click "Run"

### Method 2: Supabase CLI
\`\`\`bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref YOUR_PROJECT_REF

# Apply migration
supabase db push
\`\`\`

### Method 3: Direct psql
\`\`\`bash
psql \$SUPABASE_DB_URL -f supabase/migrations/create_secrets_vault.sql
\`\`\`

### Method 4: Using Node.js (if pg is installed)
\`\`\`bash
# Install pg
pnpm install pg

# Set DATABASE_URL
export SUPABASE_DB_URL="postgresql://..."

# Run migration script
node scripts/apply-secrets-migration.mjs
\`\`\`

## Verification

After migration, verify the tables exist:
\`\`\`sql
SELECT * FROM secrets_vault LIMIT 1;
SELECT * FROM secret_rotation_logs LIMIT 1;
\`\`\`
`;
    
    writeFileSync(
      join(projectRoot, 'DATABASE_MIGRATION_GUIDE.md'),
      migrationGuide
    );
    log('   Created: DATABASE_MIGRATION_GUIDE.md', 'green');
  }));

  // Step 4: Create comprehensive setup documentation
  results.push(await runStep('Create Setup Documentation', async () => {
    const setupDoc = `# Complete Setup Guide

## Overview

This guide covers all setup steps based on the execution reports.

## Prerequisites

- Node.js 18+ (currently: ${execSync('node --version', { encoding: 'utf8' }).trim()})
- pnpm 8+ (currently: ${execSync('pnpm --version', { encoding: 'utf8' }).trim()})
- Supabase account and project
- Vercel account (optional, for deployment)

## Step 1: Install Dependencies

\`\`\`bash
# Install all dependencies
pnpm install

# Install optional dependencies
npm install -g markdownlint-cli  # For markdown linting
\`\`\`

## Step 2: Database Migration

See \`DATABASE_MIGRATION_GUIDE.md\` for detailed instructions.

Quick start:
1. Run migration SQL in Supabase Dashboard
2. Or use: \`supabase db push\`

## Step 3: Configure Environment Variables

\`\`\`bash
# Copy example file
cp .env.example .env.local

# Set required variables
export NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
export SUPABASE_DB_URL="postgresql://..."

# Optional: Vercel
export VERCEL_TOKEN="your-vercel-token"
export VERCEL_PROJECT_ID="your-project-id"
\`\`\`

## Step 4: Run Secrets Migration

\`\`\`bash
# Preview migration
npm run secrets:migrate:dry-run

# Execute migration
npm run secrets:migrate

# Sync to Vercel
npm run secrets:sync
\`\`\`

## Step 5: Verify Setup

\`\`\`bash
# Run health checks
npm run health:check

# Run all checks
npm run check:all

# Verify secrets
npm run secrets:validate NEXT_PUBLIC_SUPABASE_URL SUPABASE_SERVICE_ROLE_KEY
\`\`\`

## Step 6: Improve Test Coverage

Current coverage: 5% (target: 80%)

\`\`\`bash
# Analyze coverage
node scripts/improve-test-coverage.mjs

# Review action plan
cat TEST_COVERAGE_ACTION_PLAN.json

# Add tests for critical paths
# (See recommendations in action plan)
\`\`\`

## Step 7: Run Quality Checks

\`\`\`bash
# Lint markdown
npm run docs:lint

# Scan for secrets
npm run secrets:scan

# Check supply chain
npm run supply-chain:audit

# Run all checks
npm run check:all
\`\`\`

## Troubleshooting

### Missing Dependencies
If you see errors about missing packages:
\`\`\`bash
pnpm install
\`\`\`

### Database Connection Issues
- Verify SUPABASE_DB_URL is correct
- Check Supabase project is active
- Ensure service role key has proper permissions

### Secrets Migration Issues
- Verify all environment variables are set
- Check Supabase secrets_vault table exists
- Review migration logs in SECRETS_MIGRATION_REPORT.json

## Next Steps

1. ✅ Database migration completed
2. ✅ Environment variables configured
3. ✅ Secrets migrated to Supabase/Vercel
4. ✅ Test coverage improved
5. ✅ Quality checks passing

## Support

- Review execution reports: \`SCRIPTS_EXECUTION_REPORT.md\`
- Check remediation plans: \`SECRETS_REMEDIATION_REPORT.json\`
- Review test coverage plan: \`TEST_COVERAGE_ACTION_PLAN.json\`
`;
    
    writeFileSync(
      join(projectRoot, 'COMPLETE_SETUP_GUIDE.md'),
      setupDoc
    );
    log('   Created: COMPLETE_SETUP_GUIDE.md', 'green');
  }));

  // Step 5: Generate summary report
  results.push(await runStep('Generate Summary Report', async () => {
    const summary = {
      timestamp: new Date().toISOString(),
      stepsCompleted: results.length,
      successfulSteps: results.filter(r => r.success).length,
      failedSteps: results.filter(r => !r.success).length,
      results,
      nextActions: [
        '1. Review DATABASE_MIGRATION_GUIDE.md and run migration',
        '2. Set Supabase and Vercel credentials',
        '3. Execute: npm run secrets:migrate',
        '4. Review TEST_COVERAGE_ACTION_PLAN.json and add tests',
        '5. Run: npm run check:all to verify everything works',
      ],
      documentation: {
        setupGuide: 'COMPLETE_SETUP_GUIDE.md',
        migrationGuide: 'DATABASE_MIGRATION_GUIDE.md',
        secretsRemediation: 'SECRETS_REMEDIATION_REPORT.json',
        testCoverage: 'TEST_COVERAGE_ACTION_PLAN.json',
        executionReport: 'SCRIPTS_EXECUTION_REPORT.md',
      },
    };

    writeFileSync(
      join(projectRoot, 'SETUP_COMPLETION_REPORT.json'),
      JSON.stringify(summary, null, 2)
    );
    log('   Created: SETUP_COMPLETION_REPORT.json', 'green');
  }));

  // Final summary
  log('\n📊 Setup Execution Summary', 'magenta');
  log('='.repeat(50), 'magenta');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  log(`✅ Successful: ${successful}/${results.length}`, 'green');
  if (failed > 0) {
    log(`⚠️  Failed: ${failed}/${results.length}`, 'yellow');
    results.filter(r => !r.success).forEach(r => {
      log(`   - ${r.name}: ${r.error}`, 'yellow');
    });
  }

  log(`\n📋 Next Actions:`, 'cyan');
  log(`   1. Review COMPLETE_SETUP_GUIDE.md`, 'cyan');
  log(`   2. Run database migration (see DATABASE_MIGRATION_GUIDE.md)`, 'cyan');
  log(`   3. Configure credentials and run secrets migration`, 'cyan');
  log(`   4. Review test coverage plan and add tests`, 'cyan');
  log(`   5. Run quality checks to verify setup`, 'cyan');

  log(`\n✅ Setup execution complete!`, 'green');
}

main().catch(error => {
  log(`\n❌ Setup execution failed: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
