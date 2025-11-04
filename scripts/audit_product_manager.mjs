#!/usr/bin/env node
/**
 * Product Manager Audit
 * Assesses: roadmap coherence, UX, telemetry, adoption
 */

import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { globSync } from 'glob';

const AUDIT_DIR = 'docs/audit_investor_suite';
mkdirSync(AUDIT_DIR, { recursive: true });

const findings = [];

// 1. Roadmap Documentation
try {
  console.log('📋 Checking roadmap documentation...');
  const roadmapFiles = globSync('**/*roadmap*.{md,json}', { ignore: ['node_modules/**'] });
  const hasRoadmap = roadmapFiles.length > 0;
  
  if (!hasRoadmap) {
    findings.push({
      id: 'PROD-001',
      title: 'Missing product roadmap documentation',
      severity: 'Major',
      domain: 'Product',
      impact: 7,
      likelihood: 8,
      description: 'No roadmap documentation found',
    });
  }
} catch (e) {
  // Non-critical
}

// 2. UX/A11y Compliance
try {
  console.log('♿ Checking accessibility...');
  const a11yCheck = execSync('npm run a11y 2>&1 || echo "A11y check not available"', { encoding: 'utf8' });
  
  if (a11yCheck.includes('violation') || a11yCheck.includes('error')) {
    findings.push({
      id: 'PROD-002',
      title: 'Accessibility violations detected',
      severity: 'Major',
      domain: 'Product',
      impact: 6,
      likelihood: 7,
      description: 'A11y checks found violations',
      evidence: a11yCheck.slice(0, 500),
    });
  }
  
  // Check for A11Y_GUIDE
  if (!existsSync('A11Y_GUIDE.md')) {
    findings.push({
      id: 'PROD-003',
      title: 'Missing accessibility guide',
      severity: 'Minor',
      domain: 'Product',
      impact: 4,
      likelihood: 5,
      description: 'A11Y_GUIDE.md not found',
    });
  }
} catch (e) {
  // Non-critical
}

// 3. Telemetry & Analytics
try {
  console.log('📊 Checking analytics setup...');
  const hasAnalytics = existsSync('docs/analytics') || 
    globSync('**/*analytics*.{ts,tsx,js}', { ignore: ['node_modules/**'] }).length > 0;
  
  if (!hasAnalytics) {
    findings.push({
      id: 'PROD-004',
      title: 'Insufficient analytics/telemetry implementation',
      severity: 'Major',
      domain: 'Product',
      impact: 7,
      likelihood: 6,
      description: 'Analytics tracking appears incomplete',
    });
  }
} catch (e) {
  // Non-critical
}

// 4. Design Token Consistency
try {
  console.log('🎨 Checking design system...');
  const hasDesignTokens = globSync('**/*tokens*.{ts,tsx,json}', { ignore: ['node_modules/**'] }).length > 0 ||
    globSync('**/theme*.{ts,tsx}', { ignore: ['node_modules/**'] }).length > 0;
  
  if (!hasDesignTokens) {
    findings.push({
      id: 'PROD-005',
      title: 'Design token system not found',
      severity: 'Minor',
      domain: 'Product',
      impact: 5,
      likelihood: 4,
      description: 'No centralized design token system detected',
    });
  }
} catch (e) {
  // Non-critical
}

// 5. Feature Flag Hygiene
try {
  console.log('🚩 Checking feature flags...');
  if (existsSync('infra/selfcheck/feature_flag_hygiene.mjs')) {
    const flagCheck = execSync('node infra/selfcheck/feature_flag_hygiene.mjs 2>&1 || true', { encoding: 'utf8' });
    if (flagCheck.includes('stale') || flagCheck.includes('unused')) {
      findings.push({
        id: 'PROD-006',
        title: 'Feature flag hygiene issues',
        severity: 'Minor',
        domain: 'Product',
        impact: 3,
        likelihood: 6,
        description: 'Stale or unused feature flags detected',
      });
    }
  }
} catch (e) {
  // Non-critical
}

// 6. User Onboarding
try {
  console.log('👋 Checking onboarding...');
  const hasOnboarding = existsSync('ONBOARDING.md') || existsSync('docs/onboarding');
  
  if (!hasOnboarding) {
    findings.push({
      id: 'PROD-007',
      title: 'Missing user onboarding documentation',
      severity: 'Minor',
      domain: 'Product',
      impact: 5,
      likelihood: 5,
      description: 'No onboarding documentation found',
    });
  }
} catch (e) {
  // Non-critical
}

const report = {
  timestamp: new Date().toISOString(),
  auditType: 'Product Manager Audit',
  findings,
  summary: {
    total: findings.length,
    critical: findings.filter(f => f.severity === 'Critical').length,
    major: findings.filter(f => f.severity === 'Major').length,
    minor: findings.filter(f => f.severity === 'Minor').length,
  },
};

writeFileSync(
  join(AUDIT_DIR, 'PRODUCT_AUDIT.json'),
  JSON.stringify(report, null, 2)
);

console.log(`✅ Product audit complete: ${findings.length} findings`);
writeFileSync(
  join(AUDIT_DIR, 'PRODUCT_AUDIT.md'),
  `# Product Manager Audit Report\n\nGenerated: ${report.timestamp}\n\n## Summary\n\n- Total Findings: ${report.summary.total}\n- Critical: ${report.summary.critical}\n- Major: ${report.summary.major}\n- Minor: ${report.summary.minor}\n\n## Findings\n\n${findings.map(f => `### ${f.id}: ${f.title}\n\n- Severity: ${f.severity}\n- Impact: ${f.impact}/10\n- Likelihood: ${f.likelihood}/10\n- Score: ${f.impact * f.likelihood}\n\n${f.description}\n`).join('\n')}`
);