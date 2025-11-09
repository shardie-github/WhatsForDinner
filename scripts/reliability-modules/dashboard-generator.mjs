#!/usr/bin/env node

/**
 * Dashboard Generator
 * Generates /admin/reliability.json and /admin/reliability.md
 * Also generates /admin/compliance.json
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export class DashboardGenerator {
  constructor(supabase, config) {
    this.supabase = supabase;
    this.config = config;
  }

  async run(results) {
    try {
      // Ensure admin directory exists
      const adminDir = this.config.adminDir;
      if (!existsSync(adminDir)) {
        mkdirSync(adminDir, { recursive: true });
      }
      
      // Generate reliability dashboard
      await this.generateReliabilityDashboard(results, adminDir);
      
      // Generate compliance dashboard
      await this.generateComplianceDashboard(results, adminDir);
      
      return {
        reliabilityJson: join(adminDir, 'reliability.json'),
        reliabilityMd: join(adminDir, 'reliability.md'),
        complianceJson: join(adminDir, 'compliance.json')
      };
    } catch (error) {
      console.error('Error generating dashboards:', error);
      throw error;
    }
  }

  async generateReliabilityDashboard(results, adminDir) {
    const reliability = {
      timestamp: new Date().toISOString(),
      uptime: {
        percentage: results.uptime.uptime,
        target: this.config.uptimeThreshold,
        status: results.uptime.uptime >= this.config.uptimeThreshold ? 'healthy' : 'degraded',
        avgLatency: results.uptime.avgLatency,
        downtime: results.uptime.downtime
      },
      dependencies: {
        outdated: results.dependencyHealth.outdated.length,
        vulnerabilities: results.dependencyHealth.vulnerabilities.length,
        highSeverity: results.dependencyHealth.vulnerabilities.filter(v => v.severity === 'high' || v.severity === 'critical').length,
        status: results.dependencyHealth.vulnerabilities.length === 0 ? 'healthy' : 'warning'
      },
      costs: {
        current: results.costForecast.currentMonthly,
        forecasted: results.costForecast.forecastedMonthly,
        budget: this.config.budget,
        status: results.costForecast.forecastedMonthly <= this.config.budget ? 'healthy' : 'warning',
        trend: results.costForecast.trend,
        breakdown: results.costForecast.breakdown
      },
      errors: {
        total: results.errorTriage.totalErrors,
        recurring: results.errorTriage.recurringFailures.length,
        errorRate: results.errorTriage.errorRate,
        status: results.errorTriage.recurringFailures.length === 0 ? 'healthy' : 'warning',
        categories: results.errorTriage.categories
      },
      overall: {
        status: this.calculateOverallStatus(results),
        score: this.calculateReliabilityScore(results)
      }
    };
    
    // Write JSON
    writeFileSync(
      join(adminDir, 'reliability.json'),
      JSON.stringify(reliability, null, 2)
    );
    
    // Write Markdown
    const markdown = this.generateReliabilityMarkdown(reliability);
    writeFileSync(
      join(adminDir, 'reliability.md'),
      markdown
    );
  }

  async generateComplianceDashboard(results, adminDir) {
    const compliance = {
      timestamp: new Date().toISOString(),
      secrets: results.security.secrets.status,
      licenses: {
        gpl: results.security.licenses.gpl,
        restricted: results.security.licenses.restricted
      },
      tls: results.security.tls,
      cors: results.security.cors,
      rls: results.security.rls,
      gdpr: results.security.gdpr.status,
      complianceScore: results.security.complianceScore,
      issues: results.security.issues,
      vulnerabilities: results.security.vulnerabilities.length,
      summary: {
        status: results.security.complianceScore >= 80 ? 'pass' : 
                results.security.complianceScore >= 60 ? 'warning' : 'fail',
        score: results.security.complianceScore
      }
    };
    
    writeFileSync(
      join(adminDir, 'compliance.json'),
      JSON.stringify(compliance, null, 2)
    );
  }

  calculateOverallStatus(results) {
    const statuses = [
      results.uptime.uptime >= this.config.uptimeThreshold ? 'healthy' : 'degraded',
      results.dependencyHealth.vulnerabilities.length === 0 ? 'healthy' : 'warning',
      results.costForecast.forecastedMonthly <= this.config.budget ? 'healthy' : 'warning',
      results.errorTriage.recurringFailures.length === 0 ? 'healthy' : 'warning',
      results.security.complianceScore >= 80 ? 'healthy' : 'warning'
    ];
    
    if (statuses.every(s => s === 'healthy')) return 'healthy';
    if (statuses.some(s => s === 'degraded')) return 'degraded';
    return 'warning';
  }

  calculateReliabilityScore(results) {
    let score = 100;
    
    // Uptime (30 points)
    const uptimeScore = results.uptime.uptime * 30;
    score = score - 30 + uptimeScore;
    
    // Dependencies (20 points)
    const vulnPenalty = Math.min(results.dependencyHealth.vulnerabilities.length * 2, 20);
    score -= vulnPenalty;
    
    // Costs (20 points)
    if (results.costForecast.forecastedMonthly > this.config.budget) {
      const overage = results.costForecast.forecastedMonthly - this.config.budget;
      const overagePercent = (overage / this.config.budget) * 100;
      score -= Math.min(overagePercent * 0.2, 20);
    }
    
    // Errors (15 points)
    const errorPenalty = Math.min(results.errorTriage.recurringFailures.length * 3, 15);
    score -= errorPenalty;
    
    // Security (15 points)
    score -= (100 - results.security.complianceScore) * 0.15;
    
    return Math.max(0, Math.round(score));
  }

  generateReliabilityMarkdown(reliability) {
    return `# Reliability Dashboard

Generated: ${reliability.timestamp}

## Overall Status

**Status**: ${reliability.overall.status.toUpperCase()}  
**Score**: ${reliability.overall.score}/100

## Uptime

- **Percentage**: ${(reliability.uptime.percentage * 100).toFixed(3)}%
- **Target**: ${(reliability.uptime.target * 100).toFixed(2)}%
- **Status**: ${reliability.uptime.status}
- **Average Latency**: ${reliability.uptime.avgLatency}ms
- **Downtime**: ${Math.round(reliability.uptime.downtime / 1000)}s

## Dependencies

- **Outdated Packages**: ${reliability.dependencies.outdated}
- **Vulnerabilities**: ${reliability.dependencies.vulnerabilities}
- **High Severity**: ${reliability.dependencies.highSeverity}
- **Status**: ${reliability.dependencies.status}

## Costs

- **Current Monthly**: $${reliability.costs.current.toFixed(2)}
- **Forecasted Monthly**: $${reliability.costs.forecasted.toFixed(2)}
- **Budget**: $${reliability.costs.budget}
- **Status**: ${reliability.costs.status}
- **Trend**: ${reliability.costs.trend}

### Breakdown

- Supabase: $${reliability.costs.breakdown.supabase.current.toFixed(2)} (forecast: $${reliability.costs.breakdown.supabase.forecasted.toFixed(2)})
- Vercel: $${reliability.costs.breakdown.vercel.current.toFixed(2)} (forecast: $${reliability.costs.breakdown.vercel.forecasted.toFixed(2)})
- Expo: $${reliability.costs.breakdown.expo.current.toFixed(2)} (forecast: $${reliability.costs.breakdown.expo.forecasted.toFixed(2)})
- GitHub: $${reliability.costs.breakdown.github.current.toFixed(2)} (forecast: $${reliability.costs.breakdown.github.forecasted.toFixed(2)})

## Errors

- **Total Errors**: ${reliability.errors.total}
- **Recurring Failures**: ${reliability.errors.recurring}
- **Error Rate**: ${reliability.errors.errorRate.toFixed(2)} errors/hour
- **Status**: ${reliability.errors.status}

### Categories

- Build: ${reliability.errors.categories.build.length}
- API: ${reliability.errors.categories.api.length}
- Auth: ${reliability.errors.categories.auth.length}
- Network: ${reliability.errors.categories.network.length}
- Other: ${reliability.errors.categories.other.length}
`;
  }
}
