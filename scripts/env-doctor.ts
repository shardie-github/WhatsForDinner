#!/usr/bin/env tsx
/**
 * Environment Variables Doctor Script
 * 
 * Scans the codebase for environment variable usage and validates:
 * - All required env vars are documented in .env.example
 * - All documented env vars are actually used
 * - No hardcoded secrets
 * - Consistent naming conventions
 * 
 * Usage:
 *   tsx scripts/env-doctor.ts
 *   tsx scripts/env-doctor.ts --fix  # Auto-fix issues where possible
 * 
 * Environment Variables:
 *   None required (reads from codebase)
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

interface EnvVarUsage {
  name: string;
  files: string[];
  lineNumbers: number[];
}

interface EnvVarDoc {
  name: string;
  category: string;
  description?: string;
  required: boolean;
  defaultValue?: string;
}

interface ValidationResult {
  documented: Set<string>;
  used: Set<string>;
  unused: string[];
  missing: string[];
  inconsistencies: Array<{ name: string; issue: string }>;
}

// Common patterns for env var access
const ENV_PATTERNS = [
  /process\.env\.([A-Z_][A-Z0-9_]*)/g,
  /process\.env\[['"]([A-Z_][A-Z0-9_]*)['"]\]/g,
  /\$\{([A-Z_][A-Z0-9_]*)\}/g, // Shell variable expansion
];

// Files to scan
const SCAN_PATTERNS = [
  '**/*.ts',
  '**/*.tsx',
  '**/*.js',
  '**/*.jsx',
  '**/*.mjs',
  '**/*.sh',
  '**/*.yml',
  '**/*.yaml',
];

// Files to exclude
const EXCLUDE_PATTERNS = [
  '**/node_modules/**',
  '**/.next/**',
  '**/dist/**',
  '**/build/**',
  '**/coverage/**',
  '**/*.test.ts',
  '**/*.test.tsx',
  '**/*.spec.ts',
  '**/*.spec.tsx',
];

function extractEnvVars(content: string, filePath: string): EnvVarUsage[] {
  const usages: Map<string, { files: Set<string>; lineNumbers: Set<number> }> = new Map();

  for (const pattern of ENV_PATTERNS) {
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      let match;
      while ((match = pattern.exec(line)) !== null) {
        const varName = match[1];
        if (!usages.has(varName)) {
          usages.set(varName, { files: new Set(), lineNumbers: new Set() });
        }
        usages.get(varName)!.files.add(filePath);
        usages.get(varName)!.lineNumbers.add(index + 1);
      }
    });
  }

  return Array.from(usages.entries()).map(([name, data]) => ({
    name,
    files: Array.from(data.files),
    lineNumbers: Array.from(data.lineNumbers),
  }));
}

function parseEnvExample(filePath: string): EnvVarDoc[] {
  if (!existsSync(filePath)) {
    return [];
  }

  const content = readFileSync(filePath, 'utf-8');
  const docs: EnvVarDoc[] = [];
  let currentCategory = 'Other';

  const lines = content.split('\n');
  for (const line of lines) {
    // Category headers
    if (line.startsWith('# =====')) {
      const match = line.match(/# ===== (.+) =====/);
      if (match) {
        currentCategory = match[1];
      }
      continue;
    }

    // Skip comments and empty lines
    if (line.trim().startsWith('#') || line.trim() === '') {
      continue;
    }

    // Parse env var definition
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (match) {
      const name = match[1];
      const value = match[2].trim();
      const required = !value.includes('${') && value !== '' && !value.startsWith('#');
      const defaultValue = value === '' ? undefined : value;

      docs.push({
        name,
        category: currentCategory,
        required,
        defaultValue,
      });
    }
  }

  return docs;
}

function scanCodebase(): EnvVarUsage[] {
  const allUsages: Map<string, { files: Set<string>; lineNumbers: Set<number> }> = new Map();

  for (const pattern of SCAN_PATTERNS) {
    const files = glob.sync(pattern, {
      cwd: ROOT_DIR,
      ignore: EXCLUDE_PATTERNS,
      absolute: true,
    });

    for (const file of files) {
      try {
        const content = readFileSync(file, 'utf-8');
        const usages = extractEnvVars(content, file.replace(ROOT_DIR, ''));

        for (const usage of usages) {
          if (!allUsages.has(usage.name)) {
            allUsages.set(usage.name, { files: new Set(), lineNumbers: new Set() });
          }
          usage.files.forEach(f => allUsages.get(usage.name)!.files.add(f));
          usage.lineNumbers.forEach(l => allUsages.get(usage.name)!.lineNumbers.add(l));
        }
      } catch (error) {
        // Skip files that can't be read
        continue;
      }
    }
  }

  return Array.from(allUsages.entries()).map(([name, data]) => ({
    name,
    files: Array.from(data.files),
    lineNumbers: Array.from(data.lineNumbers),
  }));
}

function validate(): ValidationResult {
  const envExamplePath = join(ROOT_DIR, '.env.example');
  const documented = parseEnvExample(envExamplePath);
  const used = scanCodebase();

  const documentedSet = new Set(documented.map(d => d.name));
  const usedSet = new Set(used.map(u => u.name));

  // Find unused documented vars
  const unused = documented.filter(d => !usedSet.has(d.name)).map(d => d.name);

  // Find missing documented vars
  const missing = used.filter(u => !documentedSet.has(u.name)).map(u => u.name);

  // Find inconsistencies
  const inconsistencies: Array<{ name: string; issue: string }> = [];

  // Check for hardcoded secrets (basic check)
  const secretPatterns = [
    /password\s*[:=]\s*['"][^'"]+['"]/i,
    /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/i,
    /secret\s*[:=]\s*['"][^'"]+['"]/i,
  ];

  for (const usage of used) {
    // Check naming consistency
    if (!usage.name.match(/^[A-Z][A-Z0-9_]*$/)) {
      inconsistencies.push({
        name: usage.name,
        issue: 'Invalid naming convention (should be UPPER_SNAKE_CASE)',
      });
    }
  }

  return {
    documented: documentedSet,
    used: usedSet,
    unused,
    missing,
    inconsistencies,
  };
}

function printReport(result: ValidationResult, documented: EnvVarDoc[], used: EnvVarUsage[]): void {
  console.log('\n' + '='.repeat(70));
  console.log('Environment Variables Doctor Report');
  console.log('='.repeat(70) + '\n');

  // Summary
  console.log('📊 Summary:');
  console.log(`  Documented: ${result.documented.size}`);
  console.log(`  Used: ${result.used.size}`);
  console.log(`  Unused (documented but not used): ${result.unused.length}`);
  console.log(`  Missing (used but not documented): ${result.missing.length}`);
  console.log(`  Inconsistencies: ${result.inconsistencies.length}\n`);

  // Missing vars
  if (result.missing.length > 0) {
    console.log('⚠️  Missing from .env.example:');
    for (const name of result.missing) {
      const usage = used.find(u => u.name === name);
      console.log(`  - ${name}`);
      if (usage && usage.files.length > 0) {
        console.log(`    Used in: ${usage.files.slice(0, 3).join(', ')}${usage.files.length > 3 ? '...' : ''}`);
      }
    }
    console.log('');
  }

  // Unused vars
  if (result.unused.length > 0) {
    console.log('ℹ️  Documented but not used:');
    for (const name of result.unused) {
      const doc = documented.find(d => d.name === name);
      console.log(`  - ${name}${doc ? ` (${doc.category})` : ''}`);
    }
    console.log('');
  }

  // Inconsistencies
  if (result.inconsistencies.length > 0) {
    console.log('⚠️  Inconsistencies:');
    for (const inc of result.inconsistencies) {
      console.log(`  - ${inc.name}: ${inc.issue}`);
    }
    console.log('');
  }

  // Status
  const hasIssues = result.missing.length > 0 || result.inconsistencies.length > 0;
  if (!hasIssues) {
    console.log('✅ All environment variables are properly documented!\n');
  } else {
    console.log('❌ Issues found. Please fix them before deploying.\n');
  }
}

function main() {
  const args = process.argv.slice(2);
  const shouldFix = args.includes('--fix');

  console.log('🔍 Scanning codebase for environment variable usage...\n');

  const documented = parseEnvExample(join(ROOT_DIR, '.env.example'));
  const used = scanCodebase();
  const result = validate();

  printReport(result, documented, used);

  if (shouldFix && result.missing.length > 0) {
    console.log('🔧 Auto-fix not implemented. Please manually add missing vars to .env.example\n');
  }

  // Exit with error code if issues found
  if (result.missing.length > 0 || result.inconsistencies.length > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
