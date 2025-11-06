/**
 * CI/CD Privacy Compliance Gates
 * Blocks merges if privacy requirements are not met
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface PrivacyCheckResult {
  name: string;
  passed: boolean;
  message: string;
}

/**
 * Check if RLS is enabled on all privacy tables
 */
function checkRLS(): PrivacyCheckResult {
  const migrationFiles = glob.sync('**/migrations/**/*.sql', { cwd: process.cwd() });
  const privacyMigration = migrationFiles.find((f) => f.includes('privacy'));

  if (!privacyMigration) {
    return {
      name: 'RLS Check',
      passed: false,
      message: 'Privacy migration file not found',
    };
  }

  const content = fs.readFileSync(privacyMigration, 'utf-8');
  const privacyTables = [
    'privacy_prefs',
    'app_allowlist',
    'signal_toggles',
    'telemetry_events',
    'privacy_transparency_log',
    'mfa_enforced_sessions',
  ];

  const missingRLS: string[] = [];

  for (const table of privacyTables) {
    if (!content.includes(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`)) {
      missingRLS.push(table);
    }
  }

  if (missingRLS.length > 0) {
    return {
      name: 'RLS Check',
      passed: false,
      message: `Missing RLS on tables: ${missingRLS.join(', ')}`,
    };
  }

  return {
    name: 'RLS Check',
    passed: true,
    message: 'All privacy tables have RLS enabled',
  };
}

/**
 * Check if MFA is enforced for sensitive routes
 */
function checkMFAEnforcement(): PrivacyCheckResult {
  const apiFiles = glob.sync('**/api/privacy/**/*.ts', { cwd: process.cwd() });
  const sensitiveRoutes = ['consent', 'apps', 'signals', 'export', 'delete'];

  const missingMFA: string[] = [];

  for (const route of sensitiveRoutes) {
    const routeFile = apiFiles.find((f) => f.includes(route));
    if (!routeFile) continue;

    const content = fs.readFileSync(routeFile, 'utf-8');
    if (!content.includes('requireMFA') && !content.includes('mfa')) {
      missingMFA.push(route);
    }
  }

  if (missingMFA.length > 0) {
    return {
      name: 'MFA Enforcement Check',
      passed: false,
      message: `Missing MFA enforcement on routes: ${missingMFA.join(', ')}`,
    };
  }

  return {
    name: 'MFA Enforcement Check',
    passed: true,
    message: 'All sensitive routes enforce MFA',
  };
}

/**
 * Check for disallowed fields in logs or analytics
 */
function checkPrivacyLints(): PrivacyCheckResult {
  const codeFiles = glob.sync('**/*.{ts,tsx,js,jsx}', {
    cwd: process.cwd(),
    ignore: ['**/node_modules/**', '**/.next/**', '**/dist/**'],
  });

  const disallowedPatterns = [
    /console\.log.*password/i,
    /console\.log.*token/i,
    /console\.log.*secret/i,
    /logger.*password/i,
    /logger.*token/i,
    /logger.*secret/i,
  ];

  const violations: Array<{ file: string; line: number; pattern: string }> = [];

  for (const file of codeFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      for (const pattern of disallowedPatterns) {
        if (pattern.test(lines[i])) {
          violations.push({
            file,
            line: i + 1,
            pattern: pattern.toString(),
          });
        }
      }
    }
  }

  if (violations.length > 0) {
    return {
      name: 'Privacy Lint Check',
      passed: false,
      message: `Found ${violations.length} privacy violations: ${violations.slice(0, 5).map((v) => `${v.file}:${v.line}`).join(', ')}`,
    };
  }

  return {
    name: 'Privacy Lint Check',
    passed: true,
    message: 'No privacy violations found',
  };
}

/**
 * Check if policy file exists
 */
function checkPolicyFile(): PrivacyCheckResult {
  const policyFile = path.join(process.cwd(), 'docs', 'privacy', 'monitoring-policy.md');

  if (!fs.existsSync(policyFile)) {
    return {
      name: 'Policy File Check',
      passed: false,
      message: 'Privacy policy file not found',
    };
  }

  const content = fs.readFileSync(policyFile, 'utf-8');
  const requiredSections = [
    'Purpose',
    'What We Collect',
    'Control & Transparency',
    'Security',
    'Data Retention',
    'Your Rights',
  ];

  const missingSections = requiredSections.filter((section) => !content.includes(section));

  if (missingSections.length > 0) {
    return {
      name: 'Policy File Check',
      passed: false,
      message: `Missing sections in policy: ${missingSections.join(', ')}`,
    };
  }

  return {
    name: 'Policy File Check',
    passed: true,
    message: 'Privacy policy file exists with all required sections',
  };
}

/**
 * Check if consent UI exists
 */
function checkConsentUI(): PrivacyCheckResult {
  const consentFiles = [
    'apps/web/src/components/privacy/ConsentOnboardingWizard.tsx',
    'apps/web/src/components/privacy/PrivacyHUD.tsx',
    'apps/web/src/app/settings/privacy/page.tsx',
  ];

  const missingFiles: string[] = [];

  for (const file of consentFiles) {
    const fullPath = path.join(process.cwd(), file);
    if (!fs.existsSync(fullPath)) {
      missingFiles.push(file);
    }
  }

  if (missingFiles.length > 0) {
    return {
      name: 'Consent UI Check',
      passed: false,
      message: `Missing UI files: ${missingFiles.join(', ')}`,
    };
  }

  return {
    name: 'Consent UI Check',
    passed: true,
    message: 'All consent UI components exist',
  };
}

/**
 * Run all privacy compliance checks
 */
export function runPrivacyComplianceChecks(): {
  passed: boolean;
  results: PrivacyCheckResult[];
} {
  const checks = [
    checkRLS(),
    checkMFAEnforcement(),
    checkPrivacyLints(),
    checkPolicyFile(),
    checkConsentUI(),
  ];

  const passed = checks.every((check) => check.passed);

  return {
    passed,
    results: checks,
  };
}

/**
 * Main entry point for CI/CD
 */
if (require.main === module) {
  const { passed, results } = runPrivacyComplianceChecks();

    for (const result of results) {
    const icon = result.passed ? '✅' : '❌';
      }

  if (!passed) {
        process.exit(1);
  }

    process.exit(0);
}
