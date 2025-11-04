#!/usr/bin/env node
/**
 * Investor Technical Audit
 * Assesses: performance, security, CI/CD, scalability
 */

import { execSync } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const AUDIT_DIR = 'docs/audit_investor_suite';
mkdirSync(AUDIT_DIR, { recursive: true });

const findings = [];

// 1. Performance Audit
try {
  console.log('🔍 Running performance audit...');
  const perfChecks = {
    bundleSize: execSync('npm run bundle:check 2>&1 || true', { encoding: 'utf8' }),
    lighthouse: execSync('npm run performance:lighthouse 2>&1 || echo "Lighthouse not available"', { encoding: 'utf8' }),
  };
  
  if (perfChecks.bundleSize.includes('exceeded') || perfChecks.bundleSize.includes('warning')) {
    findings.push({
      id: 'TECH-001',
      title: 'Bundle size exceeds budgets',
      severity: 'Major',
      domain: 'Tech',
      impact: 8,
      likelihood: 7,
      description: 'Bundle size checks indicate performance risks',
      evidence: perfChecks.bundleSize.slice(0, 500),
    });
  }
} catch (e) {
  findings.push({
    id: 'TECH-001',
    title: 'Performance audit script failure',
    severity: 'Minor',
    domain: 'Tech',
    impact: 5,
    likelihood: 3,
    description: `Performance audit failed: ${e.message}`,
  });
}

// 2. Security Audit
try {
  console.log('🔒 Running security audit...');
  const secChecks = {
    supplyChain: execSync('npm run supply-chain:audit 2>&1 || true', { encoding: 'utf8' }),
    secrets: execSync('npm run secrets:scan 2>&1 || true', { encoding: 'utf8' }),
  };
  
  if (secChecks.supplyChain.includes('vulnerability') || secChecks.supplyChain.includes('moderate')) {
    findings.push({
      id: 'TECH-002',
      title: 'Supply chain vulnerabilities detected',
      severity: 'Critical',
      domain: 'Tech',
      impact: 9,
      likelihood: 8,
      description: 'Dependency vulnerabilities need remediation',
      evidence: secChecks.supplyChain.slice(0, 500),
    });
  }
  
  if (secChecks.secrets.includes('found') || secChecks.secrets.includes('secret')) {
    findings.push({
      id: 'TECH-003',
      title: 'Potential secrets exposure',
      severity: 'Critical',
      domain: 'Tech',
      impact: 10,
      likelihood: 5,
      description: 'Secrets scanner detected potential issues',
    });
  }
} catch (e) {
  findings.push({
    id: 'TECH-002',
    title: 'Security audit script failure',
    severity: 'Major',
    domain: 'Tech',
    impact: 7,
    likelihood: 3,
    description: `Security audit failed: ${e.message}`,
  });
}

// 3. CI/CD Health
try {
  console.log('⚙️ Checking CI/CD health...');
  const workflows = execSync('find .github/workflows -name "*.yml" -o -name "*.yaml" 2>/dev/null | wc -l', { encoding: 'utf8' }).trim();
  const hasGovernance = execSync('test -f .github/workflows/project-governance.yml && echo "yes" || echo "no"', { encoding: 'utf8' }).trim();
  
  if (hasGovernance === 'no') {
    findings.push({
      id: 'TECH-004',
      title: 'Missing project governance workflow',
      severity: 'Major',
      domain: 'Tech',
      impact: 7,
      likelihood: 6,
      description: 'Project governance workflow is missing',
    });
  }
  
  // Check for broken workflows
  try {
    execSync('bash infra/selfcheck/ci_health.sh 2>&1', { encoding: 'utf8' });
  } catch (e) {
    findings.push({
      id: 'TECH-005',
      title: 'CI workflow health issues detected',
      severity: 'Major',
      domain: 'Tech',
      impact: 6,
      likelihood: 5,
      description: 'CI health check reported issues',
    });
  }
} catch (e) {
  findings.push({
    id: 'TECH-004',
    title: 'CI/CD audit failure',
    severity: 'Minor',
    domain: 'Tech',
    impact: 4,
    likelihood: 2,
    description: `CI/CD audit failed: ${e.message}`,
  });
}

// 4. Scalability Checks
try {
  console.log('📈 Checking scalability...');
  const hasDatabase = execSync('test -f master_supabase_schema.sql && echo "yes" || echo "no"', { encoding: 'utf8' }).trim();
  const hasObservability = execSync('test -f docker-compose.observability.yml && echo "yes" || echo "no"', { encoding: 'utf8' }).trim();
  
  if (hasObservability === 'no') {
    findings.push({
      id: 'TECH-006',
      title: 'Missing observability stack',
      severity: 'Major',
      domain: 'Tech',
      impact: 7,
      likelihood: 7,
      description: 'Observability infrastructure not configured',
    });
  }
} catch (e) {
  // Non-critical
}

// 5. Schema Drift Check
try {
  console.log('🗄️ Checking schema drift...');
  const driftCheck = execSync('bash infra/selfcheck/prisma_drift.sh 2>&1 || true', { encoding: 'utf8' });
  if (driftCheck.includes('drift') || driftCheck.includes('mismatch')) {
    findings.push({
      id: 'TECH-007',
      title: 'Database schema drift detected',
      severity: 'Major',
      domain: 'Tech',
      impact: 8,
      likelihood: 6,
      description: 'ORM and database schema are out of sync',
      evidence: driftCheck.slice(0, 500),
    });
  }
} catch (e) {
  // Non-critical if script doesn't exist
}

const report = {
  timestamp: new Date().toISOString(),
  auditType: 'Investor Technical Audit',
  findings,
  summary: {
    total: findings.length,
    critical: findings.filter(f => f.severity === 'Critical').length,
    major: findings.filter(f => f.severity === 'Major').length,
    minor: findings.filter(f => f.severity === 'Minor').length,
  },
};

writeFileSync(
  join(AUDIT_DIR, 'TECHNICAL_AUDIT.json'),
  JSON.stringify(report, null, 2)
);

console.log(`✅ Technical audit complete: ${findings.length} findings`);
writeFileSync(
  join(AUDIT_DIR, 'TECHNICAL_AUDIT.md'),
  `# Technical Audit Report\n\nGenerated: ${report.timestamp}\n\n## Summary\n\n- Total Findings: ${report.summary.total}\n- Critical: ${report.summary.critical}\n- Major: ${report.summary.major}\n- Minor: ${report.summary.minor}\n\n## Findings\n\n${findings.map(f => `### ${f.id}: ${f.title}\n\n- Severity: ${f.severity}\n- Impact: ${f.impact}/10\n- Likelihood: ${f.likelihood}/10\n- Score: ${f.impact * f.likelihood}\n\n${f.description}\n`).join('\n')}`
);