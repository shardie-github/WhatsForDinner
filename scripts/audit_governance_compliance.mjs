#!/usr/bin/env node
/**
 * Governance & Compliance Scan
 * Assesses: compliance, IP, bus-factor
 */

import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { globSync } from 'glob';

const AUDIT_DIR = 'docs/audit_investor_suite';
mkdirSync(AUDIT_DIR, { recursive: true });

const findings = [];

// 1. Compliance Documentation
try {
  console.log('📜 Checking compliance...');
  const complianceDocs = [
    'SECURITY_CHECKLIST.md',
    'AI_COMPLIANCE.md',
    'docs/gdpr-compliance.md',
    'docs/SOC2_ISO_EVIDENCE.md',
  ];
  
  const missingDocs = complianceDocs.filter(doc => !existsSync(doc));
  if (missingDocs.length > 0) {
    findings.push({
      id: 'GOV-001',
      title: 'Missing compliance documentation',
      severity: 'Major',
      domain: 'Governance',
      impact: 7,
      likelihood: 6,
      description: `Missing: ${missingDocs.join(', ')}`,
    });
  }
} catch (e) {
  // Non-critical
}

// 2. License Compliance
try {
  console.log('📄 Checking license compliance...');
  const hasLicense = existsSync('LICENSE');
  if (!hasLicense) {
    findings.push({
      id: 'GOV-002',
      title: 'Missing LICENSE file',
      severity: 'Major',
      domain: 'Governance',
      impact: 8,
      likelihood: 7,
      description: 'No LICENSE file found in repository',
    });
  }
  
  // Check for license pinning
  const packageJson = existsSync('package.json') ? 
    JSON.parse(require('fs').readFileSync('package.json', 'utf8')) : null;
  if (packageJson && !packageJson.license) {
    findings.push({
      id: 'GOV-003',
      title: 'Package.json missing license field',
      severity: 'Minor',
      domain: 'Governance',
      impact: 4,
      likelihood: 5,
      description: 'package.json should specify license',
    });
  }
} catch (e) {
  // Non-critical
}

// 3. IP Protection
try {
  console.log('🔒 Checking IP protection...');
  const hasCodeOwners = existsSync('CODEOWNERS');
  if (!hasCodeOwners) {
    findings.push({
      id: 'GOV-004',
      title: 'Missing CODEOWNERS file',
      severity: 'Minor',
      domain: 'Governance',
      impact: 5,
      likelihood: 4,
      description: 'CODEOWNERS helps with IP attribution',
    });
  }
} catch (e) {
  // Non-critical
}

// 4. Bus Factor Analysis
try {
  console.log('👥 Checking bus factor...');
  try {
    const contributors = execSync('git shortlog -sn | wc -l 2>/dev/null || echo "0"', { encoding: 'utf8' }).trim();
    const contributorCount = parseInt(contributors) || 0;
    
    if (contributorCount < 3) {
      findings.push({
        id: 'GOV-005',
        title: 'Low bus factor risk',
        severity: 'Major',
        domain: 'Governance',
        impact: 7,
        likelihood: 6,
        description: `Only ${contributorCount} contributors detected - knowledge concentration risk`,
      });
    }
  } catch (e) {
    // Git command may fail in CI
  }
} catch (e) {
  // Non-critical
}

// 5. Privacy & GDPR
try {
  console.log('🔐 Checking privacy compliance...');
  const hasPrivacy = existsSync('docs/gdpr-compliance.md') ||
    existsSync('docs/privacy-policy.md') ||
    existsSync('docs/PRIVACY_OPERATIONS.md');
  
  if (!hasPrivacy) {
    findings.push({
      id: 'GOV-006',
      title: 'Privacy/GDPR documentation missing',
      severity: 'Major',
      domain: 'Governance',
      impact: 8,
      likelihood: 7,
      description: 'Privacy compliance documentation not found',
    });
  }
} catch (e) {
  // Non-critical
}

// 6. Security Headers & Policies
try {
  console.log('🛡️ Checking security policies...');
  const hasSecurity = existsSync('SECURITY_CHECKLIST.md') ||
    existsSync('docs/SECURITY_PRIVACY.md');
  
  if (!hasSecurity) {
    findings.push({
      id: 'GOV-007',
      title: 'Security policy documentation missing',
      severity: 'Major',
      domain: 'Governance',
      impact: 8,
      likelihood: 6,
      description: 'Security checklist or policy not found',
    });
  }
} catch (e) {
  // Non-critical
}

const report = {
  timestamp: new Date().toISOString(),
  auditType: 'Governance & Compliance Scan',
  findings,
  summary: {
    total: findings.length,
    critical: findings.filter(f => f.severity === 'Critical').length,
    major: findings.filter(f => f.severity === 'Major').length,
    minor: findings.filter(f => f.severity === 'Minor').length,
  },
};

writeFileSync(
  join(AUDIT_DIR, 'GOVERNANCE_AUDIT.json'),
  JSON.stringify(report, null, 2)
);

console.log(`✅ Governance audit complete: ${findings.length} findings`);
writeFileSync(
  join(AUDIT_DIR, 'GOVERNANCE_AUDIT.md'),
  `# Governance & Compliance Scan Report\n\nGenerated: ${report.timestamp}\n\n## Summary\n\n- Total Findings: ${report.summary.total}\n- Critical: ${report.summary.critical}\n- Major: ${report.summary.major}\n- Minor: ${report.summary.minor}\n\n## Findings\n\n${findings.map(f => `### ${f.id}: ${f.title}\n\n- Severity: ${f.severity}\n- Impact: ${f.impact}/10\n- Likelihood: ${f.likelihood}/10\n- Score: ${f.impact * f.likelihood}\n\n${f.description}\n`).join('\n')}`
);