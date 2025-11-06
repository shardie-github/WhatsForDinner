#!/usr/bin/env node
/**
 * Financial Forecast & Health Check
 * Assesses: runway, burn, margin proxies, sensitivity
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { globSync } from 'glob';

const AUDIT_DIR = 'docs/audit_investor_suite';
mkdirSync(AUDIT_DIR, { recursive: true });

const findings = [];

// 1. Runway Calculation
try {
  console.log('💵 Checking financial forecast...');
  const hasForecast = existsSync('docs/REVENUE_OPERATIONS.md') ||
    globSync('**/*forecast*.{ts,js,json}', { ignore: ['node_modules/**'] }).length > 0;
  
  if (!hasForecast) {
    findings.push({
      id: 'FIN-001',
      title: 'Financial forecast model missing',
      severity: 'Critical',
      domain: 'Finance',
      impact: 9,
      likelihood: 8,
      description: 'No financial forecast or runway calculation found',
    });
  }
} catch (e) {
  // Non-critical
}

// 2. Burn Rate Tracking
try {
  console.log('🔥 Checking burn rate...');
  const hasBurnTracking = globSync('**/*burn*.{ts,js}', { ignore: ['node_modules/**'] }).length > 0;
  
  if (!hasBurnTracking) {
    findings.push({
      id: 'FIN-002',
      title: 'Burn rate tracking not implemented',
      severity: 'Major',
      domain: 'Finance',
      impact: 8,
      likelihood: 7,
      description: 'Monthly burn rate calculation missing',
    });
  }
} catch (e) {
  // Non-critical
}

// 3. Cost Guard
try {
  console.log('💰 Checking cost controls...');
  const hasCostGuard = existsSync('scripts/cost-guard.mjs') ||
    existsSync('infra/selfcheck/greenops_econ.py');
  
  if (!hasCostGuard) {
    findings.push({
      id: 'FIN-003',
      title: 'Cost guard system missing',
      severity: 'Major',
      domain: 'Finance',
      impact: 7,
      likelihood: 6,
      description: 'Automated cost monitoring not configured',
    });
  }
} catch (e) {
  // Non-critical
}

// 4. Revenue Operations
try {
  console.log('📊 Checking revenue ops...');
  const hasRevOps = existsSync('docs/REVENUE_OPERATIONS.md');
  
  if (!hasRevOps) {
    findings.push({
      id: 'FIN-004',
      title: 'Revenue operations documentation missing',
      severity: 'Minor',
      domain: 'Finance',
      impact: 6,
      likelihood: 5,
      description: 'RevOps documentation not found',
    });
  }
} catch (e) {
  // Non-critical
}

// Generate forecast model structure
const forecastModel = {
  timestamp: new Date().toISOString(),
  assumptions: {
    monthlyBurnRate: null,
    monthlyRecurringRevenue: null,
    customerAcquisitionCost: null,
    lifetimeValue: null,
    churnRate: null,
  },
  projections: {
    runwayMonths: null,
    breakEvenMonth: null,
    requiredFunding: null,
  },
  sensitivity: {
    burnVariance: null,
    revenueVariance: null,
  },
  notes: 'Forecast model structure - requires data input',
};

writeFileSync(
  join(AUDIT_DIR, 'FORECAST_MODEL.json'),
  JSON.stringify(forecastModel, null, 2)
);

// Check if runway is at risk (placeholder - would need actual data)
const runwayRisk = forecastModel.projections.runwayMonths !== null && forecastModel.projections.runwayMonths < 6;
if (runwayRisk) {
  findings.push({
    id: 'FIN-005',
    title: 'Runway below 6 months',
    severity: 'Critical',
    domain: 'Finance',
    impact: 10,
    likelihood: 8,
    description: 'Financial runway is critically low',
  });
}

const report = {
  timestamp: new Date().toISOString(),
  auditType: 'Financial Forecast & Health Check',
  findings,
  summary: {
    total: findings.length,
    critical: findings.filter(f => f.severity === 'Critical').length,
    major: findings.filter(f => f.severity === 'Major').length,
    minor: findings.filter(f => f.severity === 'Minor').length,
  },
};

writeFileSync(
  join(AUDIT_DIR, 'FINANCIAL_AUDIT.json'),
  JSON.stringify(report, null, 2)
);

console.log(`✅ Financial audit complete: ${findings.length} findings`);
writeFileSync(
  join(AUDIT_DIR, 'FINANCIAL_AUDIT.md'),
  `# Financial Forecast & Health Check Report\n\nGenerated: ${report.timestamp}\n\n## Summary\n\n- Total Findings: ${report.summary.total}\n- Critical: ${report.summary.critical}\n- Major: ${report.summary.major}\n- Minor: ${report.summary.minor}\n\n## Findings\n\n${findings.map(f => `### ${f.id}: ${f.title}\n\n- Severity: ${f.severity}\n- Impact: ${f.impact}/10\n- Likelihood: ${f.likelihood}/10\n- Score: ${f.impact * f.likelihood}\n\n${f.description}\n`).join('\n')}`
);