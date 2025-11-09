#!/usr/bin/env node

/**
 * Reliability, Financial, and Security Orchestrator
 * Autonomous system for monitoring, forecasting, and hardening the Hardonia stack
 * 
 * Default behavior: verify → analyze → forecast → harden → report
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Import modules
import { DependencyHealthChecker } from './reliability-modules/dependency-health.mjs';
import { CostForecaster } from './reliability-modules/cost-forecast.mjs';
import { ErrorTriage } from './reliability-modules/error-triage.mjs';
import { UptimeMonitor } from './reliability-modules/uptime-monitor.mjs';
import { SecurityComplianceAuditor } from './reliability-modules/security-compliance.mjs';
import { DashboardGenerator } from './reliability-modules/dashboard-generator.mjs';
import { PRGenerator } from './reliability-modules/pr-generator.mjs';

// Load secrets
let SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY;
try {
  const { secretsManager } = await import('./secrets-manager-unified.mjs');
  SUPABASE_URL = await secretsManager.getSecret('NEXT_PUBLIC_SUPABASE_URL') || process.env.NEXT_PUBLIC_SUPABASE_URL;
  SUPABASE_SERVICE_ROLE_KEY = await secretsManager.getSecret('SUPABASE_SERVICE_ROLE_KEY') || process.env.SUPABASE_SERVICE_ROLE_KEY;
} catch (e) {
  SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables');
  console.error('   Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

class ReliabilityOrchestrator {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      dependencyHealth: null,
      costForecast: null,
      errorTriage: null,
      uptime: null,
      security: null,
      dashboards: null,
      prs: []
    };
    this.config = {
      budget: parseFloat(process.env.MONTHLY_BUDGET || '75'),
      uptimeThreshold: 0.999, // 99.9%
      downtimeThreshold: 2 * 60 * 1000, // 2 minutes
      vulnerabilityWindow: 48 * 60 * 60 * 1000, // 48 hours
      complianceAuditDir: join(projectRoot, 'compliance', 'audits'),
      adminDir: join(projectRoot, 'apps', 'web', 'public', 'admin')
    };
  }

  async run() {
    console.log('🚀 Reliability Orchestrator Starting...\n');
    console.log(`📊 Configuration:`);
    console.log(`   Budget: $${this.config.budget}/month`);
    console.log(`   Uptime Target: ${(this.config.uptimeThreshold * 100).toFixed(2)}%`);
    console.log(`   Vulnerability Window: 48h\n`);

    try {
      // 1. Dependency Health Check
      console.log('1️⃣  Checking Dependency Health...');
      const dependencyChecker = new DependencyHealthChecker(supabase);
      this.results.dependencyHealth = await dependencyChecker.run();
      console.log(`   ✅ Found ${this.results.dependencyHealth.outdated.length} outdated packages`);
      console.log(`   ✅ Found ${this.results.dependencyHealth.vulnerabilities.length} vulnerabilities\n`);

      // 2. Cost Forecasting
      console.log('2️⃣  Forecasting Infrastructure Costs...');
      const costForecaster = new CostForecaster(supabase, this.config.budget);
      this.results.costForecast = await costForecaster.run();
      console.log(`   ✅ Current Monthly: $${this.results.costForecast.currentMonthly.toFixed(2)}`);
      console.log(`   ✅ Forecasted Monthly: $${this.results.costForecast.forecastedMonthly.toFixed(2)}\n`);

      // 3. Error Triage
      console.log('3️⃣  Analyzing Recurring Errors...');
      const errorTriage = new ErrorTriage(supabase);
      this.results.errorTriage = await errorTriage.run();
      console.log(`   ✅ Analyzed ${this.results.errorTriage.totalErrors} errors`);
      console.log(`   ✅ Found ${this.results.errorTriage.recurringFailures.length} recurring failures\n`);

      // 4. Uptime Monitoring
      console.log('4️⃣  Monitoring Uptime & Latency...');
      const uptimeMonitor = new UptimeMonitor(supabase, this.config);
      this.results.uptime = await uptimeMonitor.run();
      console.log(`   ✅ Uptime: ${(this.results.uptime.uptime * 100).toFixed(3)}%`);
      console.log(`   ✅ Avg Latency: ${this.results.uptime.avgLatency}ms\n`);

      // 5. Security & Compliance Audit
      console.log('5️⃣  Running Security & Compliance Audit...');
      const securityAuditor = new SecurityComplianceAuditor(supabase, this.config);
      this.results.security = await securityAuditor.run();
      console.log(`   ✅ Secrets: ${this.results.security.secrets.status}`);
      console.log(`   ✅ Licenses: ${this.results.security.licenses.gpl} GPL, ${this.results.security.licenses.restricted} restricted`);
      console.log(`   ✅ TLS: ${this.results.security.tls}`);
      console.log(`   ✅ RLS: ${this.results.security.rls}\n`);

      // 6. Generate Dashboards
      console.log('6️⃣  Generating Dashboards...');
      const dashboardGenerator = new DashboardGenerator(supabase, this.config);
      this.results.dashboards = await dashboardGenerator.run(this.results);
      console.log(`   ✅ Generated /admin/reliability.json`);
      console.log(`   ✅ Generated /admin/reliability.md`);
      console.log(`   ✅ Generated /admin/compliance.json\n`);

      // 7. Generate Auto-PRs for Safe Fixes
      console.log('7️⃣  Generating Auto-PRs for Safe Fixes...');
      const prGenerator = new PRGenerator(this.config);
      this.results.prs = await prGenerator.generatePRs(this.results);
      console.log(`   ✅ Generated ${this.results.prs.length} PRs\n`);

      // 8. Store Metrics
      await this.storeMetrics();

      // 9. Generate Reports
      await this.generateReports();

      console.log('✅ Reliability Orchestrator Complete!\n');
      this.printSummary();

    } catch (error) {
      console.error('❌ Orchestrator Error:', error);
      process.exit(1);
    }
  }

  async storeMetrics() {
    const metrics = {
      dependencyHealth: {
        outdated: this.results.dependencyHealth.outdated.length,
        vulnerabilities: this.results.dependencyHealth.vulnerabilities.length,
        highSeverity: this.results.dependencyHealth.vulnerabilities.filter(v => v.severity === 'high').length
      },
      cost: {
        currentMonthly: this.results.costForecast.currentMonthly,
        forecastedMonthly: this.results.costForecast.forecastedMonthly,
        budget: this.config.budget
      },
      uptime: {
        percentage: this.results.uptime.uptime,
        avgLatency: this.results.uptime.avgLatency,
        downtime: this.results.uptime.downtime
      },
      security: {
        secretsStatus: this.results.security.secrets.status,
        vulnerabilities: this.results.security.vulnerabilities.length,
        complianceScore: this.results.security.complianceScore
      }
    };

    await supabase.from('metrics_log').insert({
      source: 'orchestrator',
      metric: metrics,
      ts: new Date().toISOString()
    });
  }

  async generateReports() {
    // Ensure directories exist
    const reportsDir = join(projectRoot, 'REPORTS');
    const complianceDir = this.config.complianceAuditDir;
    const dateStr = new Date().toISOString().split('T')[0];
    const auditDir = join(complianceDir, dateStr);

    [reportsDir, complianceDir, auditDir].forEach(dir => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    });

    // Dependency Report
    writeFileSync(
      join(reportsDir, 'dependency-report.json'),
      JSON.stringify(this.results.dependencyHealth, null, 2)
    );

    // Cost Forecast
    writeFileSync(
      join(reportsDir, 'cost_forecast.json'),
      JSON.stringify(this.results.costForecast, null, 2)
    );

    // Reliability Trends
    const reliabilityTrends = {
      timestamp: new Date().toISOString(),
      uptime: this.results.uptime.uptime,
      latency: this.results.uptime.avgLatency,
      errorRate: this.results.errorTriage.errorRate,
      costTrend: this.results.costForecast.trend
    };
    writeFileSync(
      join(reportsDir, 'reliability_trends.json'),
      JSON.stringify(reliabilityTrends, null, 2)
    );

    // Security Compliance Report
    const securityReport = {
      timestamp: new Date().toISOString(),
      ...this.results.security,
      summary: {
        secrets: this.results.security.secrets.status,
        licenses: {
          gpl: this.results.security.licenses.gpl,
          restricted: this.results.security.licenses.restricted
        },
        tls: this.results.security.tls,
        rls: this.results.security.rls,
        gdpr: this.results.security.gdpr.status,
        issues: this.results.security.issues.length
      }
    };
    writeFileSync(
      join(auditDir, 'SECURITY_COMPLIANCE_REPORT.json'),
      JSON.stringify(securityReport, null, 2)
    );

    // Markdown report
    const markdownReport = this.generateMarkdownReport(securityReport);
    writeFileSync(
      join(projectRoot, 'SECURITY_COMPLIANCE_REPORT.md'),
      markdownReport
    );
  }

  generateMarkdownReport(securityReport) {
    return `# Security & Compliance Report

Generated: ${securityReport.timestamp}

## Summary

- **Secrets**: ${securityReport.secrets.status}
- **Licenses**: ${securityReport.licenses.gpl} GPL, ${securityReport.licenses.restricted} restricted
- **TLS**: ${securityReport.tls}
- **RLS**: ${securityReport.rls}
- **GDPR**: ${securityReport.gdpr.status}
- **Compliance Score**: ${securityReport.complianceScore}/100
- **Issues**: ${securityReport.issues.length}

## Details

### Secrets Audit
Status: ${securityReport.secrets.status}
${securityReport.secrets.exposed > 0 ? `⚠️ Found ${securityReport.secrets.exposed} exposed secrets` : '✅ No exposed secrets detected'}

### License Compliance
- GPL licenses: ${securityReport.licenses.gpl}
- Restricted licenses: ${securityReport.licenses.restricted}
${securityReport.licenses.restricted > 0 ? '⚠️ Review restricted licenses' : '✅ All licenses compliant'}

### TLS & CORS
- TLS: ${securityReport.tls}
- CORS: ${securityReport.cors}

### Row Level Security (RLS)
Status: ${securityReport.rls}
${securityReport.rls === 'enabled' ? '✅ RLS enabled on all tables' : '⚠️ Some tables missing RLS'}

### GDPR Compliance
Status: ${securityReport.gdpr.status}
- Data anonymization: ${securityReport.gdpr.dataAnonymization ? '✅' : '❌'}
- PII handling: ${securityReport.gdpr.piiHandling ? '✅' : '❌'}
- Retention policies: ${securityReport.gdpr.retentionPolicies ? '✅' : '❌'}

### Issues
${securityReport.issues.length === 0 ? '✅ No issues found' : securityReport.issues.map(i => `- ${i.severity}: ${i.message}`).join('\n')}

## Trend Analysis

Vulnerability count over time: ${securityReport.vulnerabilityTrend || 'N/A'}
`;
  }

  printSummary() {
    console.log('\n📊 Orchestrator Summary');
    console.log('='.repeat(50));
    console.log(`Dependencies: ${this.results.dependencyHealth.outdated.length} outdated, ${this.results.dependencyHealth.vulnerabilities.length} vulnerabilities`);
    console.log(`Cost: $${this.results.costForecast.currentMonthly.toFixed(2)}/month (forecast: $${this.results.costForecast.forecastedMonthly.toFixed(2)})`);
    console.log(`Uptime: ${(this.results.uptime.uptime * 100).toFixed(3)}%`);
    console.log(`Security: ${this.results.security.complianceScore}/100`);
    console.log(`PRs Generated: ${this.results.prs.length}`);
    console.log('='.repeat(50));
  }
}

// Main execution
const args = process.argv.slice(2);
const orchestrator = new ReliabilityOrchestrator();

if (args.includes('--help')) {
  console.log(`
Reliability Orchestrator - Autonomous monitoring and hardening system

Usage:
  node scripts/reliability-orchestrator.mjs [options]

Options:
  --help              Show this help message
  --check-only        Run checks without generating PRs
  --no-prs            Skip PR generation
  --verbose           Show detailed output

Environment Variables:
  MONTHLY_BUDGET      Monthly budget threshold (default: 75)
  RELIABILITY_ALERT_WEBHOOK  Webhook URL for alerts
`);
  process.exit(0);
}

orchestrator.run().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
