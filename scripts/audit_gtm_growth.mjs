#!/usr/bin/env node
/**
 * GTM & Growth Audit
 * Assesses: funnel, CAC/LTV, channel mix
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { globSync } from 'glob';

const AUDIT_DIR = 'docs/audit_investor_suite';
mkdirSync(AUDIT_DIR, { recursive: true });

const findings = [];

// 1. GTM Documentation
try {
  console.log('📈 Checking GTM documentation...');
  const gtmDocs = globSync('gtm/**/*.md', { ignore: ['node_modules/**'] });
  const hasGTM = gtmDocs.length > 0 || existsSync('gtm');
  
  if (!hasGTM) {
    findings.push({
      id: 'GTM-001',
      title: 'Missing GTM strategy documentation',
      severity: 'Major',
      domain: 'GTM',
      impact: 8,
      likelihood: 7,
      description: 'GTM documentation not found',
    });
  }
} catch (e) {
  // Non-critical
}

// 2. Funnel Analytics
try {
  console.log('🔍 Checking funnel tracking...');
  const hasFunnel = globSync('**/*funnel*.{ts,tsx,js}', { ignore: ['node_modules/**'] }).length > 0 ||
    existsSync('docs/REVENUE_OPERATIONS.md');
  
  if (!hasFunnel) {
    findings.push({
      id: 'GTM-002',
      title: 'Funnel tracking not implemented',
      severity: 'Major',
      domain: 'GTM',
      impact: 7,
      likelihood: 6,
      description: 'Conversion funnel tracking appears missing',
    });
  }
} catch (e) {
  // Non-critical
}

// 3. CAC/LTV Calculation
try {
  console.log('💰 Checking CAC/LTV metrics...');
  const hasMetrics = existsSync('docs/REVENUE_OPERATIONS.md') ||
    globSync('**/*revenue*.{ts,tsx,js}', { ignore: ['node_modules/**'] }).length > 0;
  
  if (!hasMetrics) {
    findings.push({
      id: 'GTM-003',
      title: 'CAC/LTV metrics not tracked',
      severity: 'Major',
      domain: 'GTM',
      impact: 8,
      likelihood: 7,
      description: 'Customer acquisition cost and lifetime value tracking missing',
    });
  }
} catch (e) {
  // Non-critical
}

// 4. Channel Mix Analysis
try {
  console.log('📊 Checking channel mix...');
  const hasChannelMix = globSync('**/*channel*.{ts,tsx,js}', { ignore: ['node_modules/**'] }).length > 0;
  
  if (!hasChannelMix) {
    findings.push({
      id: 'GTM-004',
      title: 'Channel mix tracking incomplete',
      severity: 'Minor',
      domain: 'GTM',
      impact: 6,
      likelihood: 5,
      description: 'Marketing channel attribution not implemented',
    });
  }
} catch (e) {
  // Non-critical
}

// 5. Growth Systems
try {
  console.log('🚀 Checking growth systems...');
  const hasGrowth = existsSync('GROWTH_SYSTEMS_IMPLEMENTATION.md') ||
    globSync('**/*growth*.{ts,tsx,js}', { ignore: ['node_modules/**'] }).length > 0;
  
  if (!hasGrowth) {
    findings.push({
      id: 'GTM-005',
      title: 'Growth systems not implemented',
      severity: 'Major',
      domain: 'GTM',
      impact: 7,
      likelihood: 6,
      description: 'Growth automation and systems appear missing',
    });
  }
} catch (e) {
  // Non-critical
}

const report = {
  timestamp: new Date().toISOString(),
  auditType: 'GTM & Growth Audit',
  findings,
  summary: {
    total: findings.length,
    critical: findings.filter(f => f.severity === 'Critical').length,
    major: findings.filter(f => f.severity === 'Major').length,
    minor: findings.filter(f => f.severity === 'Minor').length,
  },
};

writeFileSync(
  join(AUDIT_DIR, 'GTM_AUDIT.json'),
  JSON.stringify(report, null, 2)
);

// Generate funnel JSON structure
const funnelData = {
  timestamp: new Date().toISOString(),
  stages: ['awareness', 'interest', 'consideration', 'purchase', 'retention'],
  metrics: {
    cac: null,
    ltv: null,
    ltvCacRatio: null,
    channelMix: {},
  },
  notes: 'Funnel data structure - requires implementation',
};

writeFileSync(
  join(AUDIT_DIR, 'GTM_FUNNEL.json'),
  JSON.stringify(funnelData, null, 2)
);

console.log(`✅ GTM audit complete: ${findings.length} findings`);
writeFileSync(
  join(AUDIT_DIR, 'GTM_AUDIT.md'),
  `# GTM & Growth Audit Report\n\nGenerated: ${report.timestamp}\n\n## Summary\n\n- Total Findings: ${report.summary.total}\n- Critical: ${report.summary.critical}\n- Major: ${report.summary.major}\n- Minor: ${report.summary.minor}\n\n## Findings\n\n${findings.map(f => `### ${f.id}: ${f.title}\n\n- Severity: ${f.severity}\n- Impact: ${f.impact}/10\n- Likelihood: ${f.likelihood}/10\n- Score: ${f.impact * f.likelihood}\n\n${f.description}\n`).join('\n')}`
);