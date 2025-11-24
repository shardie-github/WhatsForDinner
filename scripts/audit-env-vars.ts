#!/usr/bin/env tsx
/**
 * Environment Variables Usage Audit
 * 
 * Scans codebase for actual usage of environment variables vs documented ones
 * 
 * Usage:
 *   tsx scripts/audit-env-vars.ts
 * 
 * Output:
 *   - Lists all env vars found in code
 *   - Compares with .env.example
 *   - Identifies unused documented vars
 *   - Identifies undocumented used vars
 */

import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { createComponentLogger } from '@whats-for-dinner/utils';

const logger = createComponentLogger('audit-env-vars');

interface EnvVarUsage {
  name: string;
  files: string[];
  count: number;
}

interface AuditResult {
  documented: Set<string>;
  used: Map<string, EnvVarUsage>;
  unused: string[];
  undocumented: string[];
}

async function getDocumentedVars(): Promise<Set<string>> {
  const envExamplePath = '.env.example';
  if (!existsSync(envExamplePath)) {
    logger.warn('⚠️  .env.example not found');
    return new Set();
  }

  const content = readFileSync(envExamplePath, 'utf-8');
  const vars = new Set<string>();

  // Extract variable names (lines starting with variable assignments)
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    // Skip comments and empty lines
    if (trimmed.startsWith('#') || trimmed === '') continue;
    
    // Extract variable name (before =)
    const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)/);
    if (match) {
      vars.add(match[1]);
    }
  }

  return vars;
}

async function findUsedVars(): Promise<Map<string, EnvVarUsage>> {
  const used = new Map<string, EnvVarUsage>();

  try {
    // Search for process.env.*, Deno.env.*, import.meta.env.*
    const patterns = [
      'process\\.env\\.([A-Z_][A-Z0-9_]*)',
      'Deno\\.env\\.get\\([\'"]([A-Z_][A-Z0-9_]*)[\'"]',
      'import\\.meta\\.env\\.([A-Z_][A-Z0-9_]*)',
      '\\$\\{\\s*secrets\\.([A-Z_][A-Z0-9_]*)\\s*\\}',
      '\\$\\{\\s*env\\.([A-Z_][A-Z0-9_]*)\\s*\\}',
    ];

    for (const pattern of patterns) {
      try {
        const result = execSync(
          `grep -r -E "${pattern}" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.yml" --include="*.yaml" . || true`,
          { encoding: 'utf-8', cwd: process.cwd() }
        );

        const lines = result.split('\n').filter(l => l.trim());
        for (const line of lines) {
          // Extract variable name from match
          const match = line.match(new RegExp(pattern));
          if (match && match[1]) {
            const varName = match[1];
            const filePath = line.split(':')[0];

            if (!used.has(varName)) {
              used.set(varName, {
                name: varName,
                files: [],
                count: 0,
              });
            }

            const usage = used.get(varName)!;
            if (!usage.files.includes(filePath)) {
              usage.files.push(filePath);
            }
            usage.count++;
          }
        }
      } catch (error) {
        // grep returns non-zero if no matches found, which is fine
      }
    }
  } catch (error) {
    logger.error('Error finding used vars:', { error });
  }

  return used;
}

async function audit(): Promise<AuditResult> {
  logger.info('🔍 Auditing environment variables...\n');

  const documented = await getDocumentedVars();
  const used = await findUsedVars();

  logger.info(`📋 Found ${documented.size} documented variables`);
  logger.info(`💻 Found ${used.size} variables used in code\n`);

  // Find unused documented vars
  const unused: string[] = [];
  for (const varName of documented) {
    if (!used.has(varName)) {
      unused.push(varName);
    }
  }

  // Find undocumented used vars
  const undocumented: string[] = [];
  for (const varName of used.keys()) {
    if (!documented.has(varName)) {
      undocumented.push(varName);
    }
  }

  return {
    documented,
    used,
    unused,
    undocumented,
  };
}

async function main() {
  const result = await audit();

  logger.info('='.repeat(60));
  logger.info('Environment Variables Audit Results');
  logger.info('='.repeat(60) + '\n');

  // Unused documented vars
  if (result.unused.length > 0) {
    logger.info(`⚠️  Unused Documented Variables (${result.unused.length}):`);
    logger.info('   These are documented in .env.example but not used in code:');
    result.unused
      .sort()
      .slice(0, 20) // Show first 20
      .forEach(v => logger.info(`   - ${v}`));
    if (result.unused.length > 20) {
      logger.info(`   ... and ${result.unused.length - 20} more`);
    }
    logger.info('');
  } else {
    logger.info('✅ No unused documented variables\n');
  }

  // Undocumented used vars
  if (result.undocumented.length > 0) {
    logger.info(`⚠️  Undocumented Used Variables (${result.undocumented.length}):`);
    logger.info('   These are used in code but not documented in .env.example:');
    result.undocumented
      .sort()
      .slice(0, 20) // Show first 20
      .forEach(v => {
        const usage = result.used.get(v)!;
        logger.info(`   - ${v} (used in ${usage.files.length} file(s))`);
      });
    if (result.undocumented.length > 20) {
      logger.info(`   ... and ${result.undocumented.length - 20} more`);
    }
    logger.info('');
  } else {
    logger.info('✅ All used variables are documented\n');
  }

  // Summary
  logger.info('='.repeat(60));
  logger.info('Summary');
  logger.info('='.repeat(60));
  logger.info(`Total documented: ${result.documented.size}`);
  logger.info(`Total used: ${result.used.size}`);
  logger.info(`Unused documented: ${result.unused.length}`);
  logger.info(`Undocumented used: ${result.undocumented.length}`);
  logger.info('='.repeat(60) + '\n');

  // Recommendations
  if (result.unused.length > 0 || result.undocumented.length > 0) {
    logger.info('💡 Recommendations:');
    if (result.unused.length > 0) {
      logger.info(`   1. Review ${result.unused.length} unused documented variables`);
      logger.info('      - Remove from .env.example if truly unused');
      logger.info('      - Or mark as "optional" if planned for future use');
    }
    if (result.undocumented.length > 0) {
      logger.info(`   2. Document ${result.undocumented.length} undocumented used variables`);
      logger.info('      - Add to .env.example with descriptions');
      logger.info('      - Mark as required or optional');
    }
    logger.info('');
  }

  // Exit with error if there are issues
  const hasIssues = result.unused.length > 0 || result.undocumented.length > 0;
  process.exit(hasIssues ? 1 : 0);
}

main().catch((error) => {
  logger.error('Fatal error:', { error });
  process.exit(1);
});
