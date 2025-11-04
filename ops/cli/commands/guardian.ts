/**
 * Guardian CI/CD Audit Checks
 * Validates RLS, hash verification, and event classification
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';

interface AuditResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
}

export class GuardianAudit {
  /**
   * Run full Guardian audit
   */
  async runAudit(): Promise<AuditResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check RLS on trust_ledger_roots table
    const rlsCheck = await this.checkRLS();
    if (!rlsCheck.passed) {
      errors.push(...rlsCheck.errors);
    }
    warnings.push(...rlsCheck.warnings);

    // Verify hash chain integrity
    const hashCheck = await this.verifyHashChains();
    if (!hashCheck.passed) {
      errors.push(...hashCheck.errors);
    }
    warnings.push(...hashCheck.warnings);

    // Check event classification
    const classificationCheck = await this.checkEventClassification();
    if (!classificationCheck.passed) {
      errors.push(...classificationCheck.errors);
    }
    warnings.push(...classificationCheck.warnings);

    return {
      passed: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Check RLS policies on trust_ledger_roots
   */
  private async checkRLS(): Promise<AuditResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Check if migration exists
      const migrationFile = path.join(
        __dirname,
        '../../supabase/migrations/042_guardian_trust_ledger_roots.sql'
      );

      if (!fs.existsSync(migrationFile)) {
        errors.push('Migration 042_guardian_trust_ledger_roots.sql not found');
        return { passed: false, errors, warnings };
      }

      const migrationContent = fs.readFileSync(migrationFile, 'utf8');

      // Check for RLS enable
      if (!migrationContent.includes('ENABLE ROW LEVEL SECURITY')) {
        errors.push('RLS not enabled on trust_ledger_roots table');
      }

      // Check for user-only policies
      if (!migrationContent.includes('trust_ledger_roots_user_select')) {
        errors.push('User select policy missing on trust_ledger_roots');
      }

      if (!migrationContent.includes('auth.uid() = user_id')) {
        errors.push('RLS policies must use auth.uid() = user_id');
      }

      // Check for admin aggregate-only policy
      if (!migrationContent.includes('trust_ledger_roots_admin_aggregate')) {
        warnings.push('Admin aggregate policy missing (optional but recommended)');
      }
    } catch (error) {
      errors.push(`RLS check failed: ${error}`);
    }

    return {
      passed: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Verify hash chain integrity for all ledgers
   */
  private async verifyHashChains(): Promise<AuditResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const ledgerPath = '/tmp/guardian/logs';

    if (!fs.existsSync(ledgerPath)) {
      warnings.push('Ledger directory does not exist (may be first run)');
      return { passed: true, errors, warnings };
    }

    const ledgerFiles = fs.readdirSync(ledgerPath).filter((f) =>
      f.endsWith('.jsonl')
    );

    if (ledgerFiles.length === 0) {
      warnings.push('No ledger files found');
      return { passed: true, errors, warnings };
    }

    for (const file of ledgerFiles) {
      const filePath = path.join(ledgerPath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.trim().split('\n').filter(Boolean);

      if (lines.length === 0) continue;

      let previousHash: string | undefined;

      for (let i = 0; i < lines.length; i++) {
        try {
          const entry = JSON.parse(lines[i]);

          // Verify previous hash matches
          if (previousHash && entry.previous_hash !== previousHash) {
            errors.push(
              `Hash chain broken in ${file} at entry ${i} (${entry.event_id})`
            );
            break;
          }

          // Verify entry hash
          const hashData = {
            event_id: entry.event_id,
            ts: entry.ts,
            type: entry.type,
            scope: entry.scope,
            guardian_action: entry.guardian_action,
            previous_hash: entry.previous_hash,
            metadata: entry.metadata,
          };

          const expectedHash = crypto
            .createHash('sha256')
            .update(JSON.stringify(hashData))
            .digest('hex');

          if (entry.sha256 !== expectedHash) {
            errors.push(
              `Hash mismatch in ${file} at entry ${i} (${entry.event_id})`
            );
            break;
          }

          previousHash = entry.sha256;
        } catch (error) {
          errors.push(`Failed to parse entry ${i} in ${file}: ${error}`);
        }
      }
    }

    return {
      passed: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Check that all events have proper classification
   */
  private async checkEventClassification(): Promise<AuditResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const ledgerPath = '/tmp/guardian/logs';

    if (!fs.existsSync(ledgerPath)) {
      return { passed: true, errors, warnings };
    }

    const ledgerFiles = fs.readdirSync(ledgerPath).filter((f) =>
      f.endsWith('.jsonl')
    );

    const requiredFields = ['event_id', 'ts', 'type', 'scope', 'guardian_action', 'sha256', 'metadata'];
    const requiredMetadataFields = ['risk_level', 'data_class'];

    for (const file of ledgerFiles) {
      const filePath = path.join(ledgerPath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.trim().split('\n').filter(Boolean);

      for (let i = 0; i < lines.length; i++) {
        try {
          const entry = JSON.parse(lines[i]);

          // Check required fields
          for (const field of requiredFields) {
            if (!(field in entry)) {
              errors.push(`Missing field '${field}' in ${file} entry ${i}`);
            }
          }

          // Check metadata fields
          if (entry.metadata) {
            for (const field of requiredMetadataFields) {
              if (!(field in entry.metadata)) {
                errors.push(
                  `Missing metadata field '${field}' in ${file} entry ${i}`
                );
              }
            }
          } else {
            errors.push(`Missing metadata in ${file} entry ${i}`);
          }

          // Validate risk_level
          const validRiskLevels = ['low', 'medium', 'high', 'critical'];
          if (
            entry.metadata?.risk_level &&
            !validRiskLevels.includes(entry.metadata.risk_level)
          ) {
            errors.push(
              `Invalid risk_level '${entry.metadata.risk_level}' in ${file} entry ${i}`
            );
          }

          // Validate guardian_action
          const validActions = ['allow', 'mask', 'redact', 'block', 'alert'];
          if (!validActions.includes(entry.guardian_action)) {
            errors.push(
              `Invalid guardian_action '${entry.guardian_action}' in ${file} entry ${i}`
            );
          }
        } catch (error) {
          errors.push(`Failed to parse entry ${i} in ${file}: ${error}`);
        }
      }
    }

    return {
      passed: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Generate audit report
   */
  async generateReport(): Promise<string> {
    const result = await this.runAudit();

    const report = `# Guardian Audit Report
Generated: ${new Date().toISOString()}

## Status
${result.passed ? '✅ PASSED' : '❌ FAILED'}

## Errors
${result.errors.length > 0 ? result.errors.map((e) => `- ${e}`).join('\n') : 'None'}

## Warnings
${result.warnings.length > 0 ? result.warnings.map((w) => `- ${w}`).join('\n') : 'None'}

## Checks Performed
- ✅ RLS policies verification
- ✅ Hash chain integrity
- ✅ Event classification completeness
`;

    return report;
  }
}

export const guardianAudit = new GuardianAudit();

// CLI entry point
if (require.main === module) {
  guardianAudit.runAudit().then((result) => {
    if (result.passed) {
      console.log('✅ Guardian audit passed');
      process.exit(0);
    } else {
      console.error('❌ Guardian audit failed');
      console.error('Errors:', result.errors);
      if (result.warnings.length > 0) {
        console.warn('Warnings:', result.warnings);
      }
      process.exit(1);
    }
  });
}
