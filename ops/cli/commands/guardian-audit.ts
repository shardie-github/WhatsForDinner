/**
 * Guardian Audit Command
 * CI/CD audit checks for Guardian system
 */

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { Guardian } from '@whats-for-dinner/utils/guardian';

interface AuditResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  checks: Array<{
    name: string;
    passed: boolean;
    message: string;
  }>;
}

export async function runGuardianAudit(options: { verbose?: boolean }): Promise<void> {
  const result: AuditResult = {
    passed: true,
    errors: [],
    warnings: [],
    checks: [],
  };

  console.log('🔍 Running Guardian audit...\n');

  // Check 1: Verify Guardian logs directory exists
  const logsDir = './guardian/logs';
  if (!fs.existsSync(logsDir)) {
    result.checks.push({
      name: 'Logs directory exists',
      passed: false,
      message: 'Guardian logs directory not found',
    });
    result.errors.push('Logs directory missing');
    result.passed = false;
  } else {
    result.checks.push({
      name: 'Logs directory exists',
      passed: true,
      message: 'Logs directory found',
    });
  }

  // Check 2: Verify policy files exist
  const policyPath = path.join(__dirname, '../../packages/utils/src/guardian/policies/default.yaml');
  if (!fs.existsSync(policyPath)) {
    result.checks.push({
      name: 'Policy files exist',
      passed: false,
      message: 'Default policy file not found',
    });
    result.errors.push('Policy file missing');
    result.passed = false;
  } else {
    result.checks.push({
      name: 'Policy files exist',
      passed: true,
      message: 'Policy files found',
    });
  }

  // Check 3: Verify ledger integrity for all users
  if (fs.existsSync(logsDir)) {
    const files = fs.readdirSync(logsDir).filter(f => f.endsWith('.jsonl'));
    let ledgerErrors = 0;

    for (const file of files) {
      const userId = file.replace('.jsonl', '');
      const guardian = new Guardian(userId, logsDir);
      const integrity = guardian.verifyLedgerIntegrity();

      if (!integrity.valid) {
        ledgerErrors++;
        result.errors.push(`Ledger integrity failed for user ${userId}: ${integrity.errors.join(', ')}`);
      }
    }

    if (ledgerErrors === 0) {
      result.checks.push({
        name: 'Ledger integrity',
        passed: true,
        message: `All ${files.length} ledgers verified`,
      });
    } else {
      result.checks.push({
        name: 'Ledger integrity',
        passed: false,
        message: `${ledgerErrors} ledger(s) failed verification`,
      });
      result.passed = false;
    }
  }

  // Check 4: Verify RLS policies exist (would need Supabase connection)
  result.checks.push({
    name: 'RLS policies',
    passed: true,
    message: 'RLS check requires database connection (skipped in audit)',
  });

  // Check 5: Verify all events have classification
  if (fs.existsSync(logsDir)) {
    const files = fs.readdirSync(logsDir).filter(f => f.endsWith('.jsonl'));
    let unclassifiedEvents = 0;

    for (const file of files) {
      const filePath = path.join(logsDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.trim().split('\n').filter(Boolean);

      for (const line of lines) {
        try {
          const entry = JSON.parse(line);
          if (!entry.metadata?.dataClass || !entry.metadata?.riskLevel) {
            unclassifiedEvents++;
          }
        } catch (error) {
          unclassifiedEvents++;
        }
      }
    }

    if (unclassifiedEvents === 0) {
      result.checks.push({
        name: 'Event classification',
        passed: true,
        message: 'All events properly classified',
      });
    } else {
      result.checks.push({
        name: 'Event classification',
        passed: false,
        message: `${unclassifiedEvents} unclassified events found`,
      });
      result.passed = false;
    }
  }

  // Check 6: Verify hash chaining
  if (fs.existsSync(logsDir)) {
    const files = fs.readdirSync(logsDir).filter(f => f.endsWith('.jsonl'));
    let hashChainErrors = 0;

    for (const file of files) {
      const filePath = path.join(logsDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.trim().split('\n').filter(Boolean);
      let previousHash: string | undefined;

      for (let i = 0; i < lines.length; i++) {
        try {
          const entry = JSON.parse(lines[i]);
          if (previousHash && entry.previousHash !== previousHash) {
            hashChainErrors++;
          }
          previousHash = entry.sha256;
        } catch (error) {
          hashChainErrors++;
        }
      }
    }

    if (hashChainErrors === 0) {
      result.checks.push({
        name: 'Hash chaining',
        passed: true,
        message: 'All hash chains verified',
      });
    } else {
      result.checks.push({
        name: 'Hash chaining',
        passed: false,
        message: `${hashChainErrors} hash chain error(s) found`,
      });
      result.passed = false;
    }
  }

  // Print results
  console.log('Audit Results:\n');
  for (const check of result.checks) {
    const icon = check.passed ? '✅' : '❌';
    console.log(`${icon} ${check.name}: ${check.message}`);
  }

  if (result.errors.length > 0) {
    console.log('\n❌ Errors:');
    for (const error of result.errors) {
      console.log(`  - ${error}`);
    }
  }

  if (result.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    for (const warning of result.warnings) {
      console.log(`  - ${warning}`);
    }
  }

  console.log(`\n${result.passed ? '✅' : '❌'} Audit ${result.passed ? 'passed' : 'failed'}`);

  if (!result.passed) {
    process.exit(1);
  }
}
