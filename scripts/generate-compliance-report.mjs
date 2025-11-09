#!/usr/bin/env node
/**
 * Generate compliance markdown report from JSON
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const complianceJsonPath = join(projectRoot, 'admin', 'compliance.json');
const complianceMdPath = join(projectRoot, 'admin', 'compliance.md');

if (!existsSync(complianceJsonPath)) {
  console.error('❌ compliance.json not found. Run agent first.');
  process.exit(1);
}

const compliance = JSON.parse(readFileSync(complianceJsonPath, 'utf-8'));

const checks = Object.entries(compliance.checks || {}).map(([name, check]: [string, any]) => {
  const status = check.passed ? '✅' : '❌';
  return `- ${status} **${name.toUpperCase()}**: ${check.details || (check.passed ? 'Passed' : 'Failed')}`;
}).join('\n');

const md = `# Security Compliance Report

**Last Updated**: ${compliance.timestamp || 'Never'}

## Overall Score

**${(compliance.score * 100).toFixed(0)}%** (${compliance.score >= 0.8 ? '✅ Compliant' : compliance.score >= 0.6 ? '⚠️ Needs Improvement' : '❌ Non-Compliant'})

## Security Checks

${checks}

## Recommendations

${compliance.recommendations && compliance.recommendations.length > 0
  ? compliance.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')
  : 'No immediate recommendations. All checks passed.'}

## Next Steps

1. Review failed checks above
2. Address recommendations
3. Re-run agent to verify fixes
`;

writeFileSync(complianceMdPath, md);
console.log('✅ Compliance markdown report generated');
