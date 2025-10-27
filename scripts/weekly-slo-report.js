#!/usr/bin/env node

/**
 * Weekly SLO Report Generator
 * 
 * Generates weekly SLO performance reports
 * Includes trends, error budget analysis, and recommendations
 */

const fs = require('fs');
const path = require('path');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Mock data - in production, this would come from your monitoring system
const mockWeeklyData = {
  week: '2024-W51',
  dateRange: '2024-12-16 to 2024-12-22',
  slos: {
    availability: {
      current: 99.95,
      target: 99.9,
      trend: 'stable',
      incidents: 0,
      downtime: '2.4 minutes'
    },
    latency: {
      current: 98.5,
      target: 95,
      trend: 'improving',
      p95: 420,
      p99: 850
    },
    errorRate: {
      current: 0.05,
      target: 0.1,
      trend: 'stable',
      totalErrors: 12,
      errorTypes: {
        '4xx': 8,
        '5xx': 4
      }
    }
  },
  errorBudgets: {
    availability: {
      consumed: 25,
      remaining: 75,
      trend: 'stable'
    },
    latency: {
      consumed: 30,
      remaining: 70,
      trend: 'improving'
    },
    errorRate: {
      consumed: 20,
      remaining: 80,
      trend: 'stable'
    }
  },
  criticalUserJourneys: {
    userRegistration: {
      successRate: 99.8,
      avgTime: 3.2,
      failures: 2
    },
    mealGeneration: {
      successRate: 99.2,
      avgTime: 8.5,
      failures: 8
    },
    paymentProcessing: {
      successRate: 99.9,
      avgTime: 2.1,
      failures: 1
    },
    mealPlanning: {
      successRate: 99.1,
      avgTime: 7.8,
      failures: 9
    },
    userAuthentication: {
      successRate: 99.95,
      avgTime: 1.8,
      failures: 1
    }
  },
  incidents: [
    {
      id: 'INC-2024-001',
      title: 'Database connection timeout',
      severity: 'medium',
      duration: '15 minutes',
      impact: '5% of users affected',
      resolution: 'Restarted database connection pool'
    }
  ],
  recommendations: [
    'Monitor database connection pool more closely',
    'Consider implementing circuit breaker for external APIs',
    'Review error handling for meal generation service'
  ]
};

class WeeklySLOReport {
  constructor(data) {
    this.data = data;
    this.report = {
      week: data.week,
      dateRange: data.dateRange,
      generated: new Date().toISOString(),
      summary: {},
      details: {},
      recommendations: []
    };
  }

  /**
   * Generate report summary
   */
  generateSummary() {
    const slos = this.data.slos;
    const errorBudgets = this.data.errorBudgets;

    this.report.summary = {
      overallStatus: 'HEALTHY',
      sloCompliance: {
        availability: slos.availability.current >= slos.availability.target,
        latency: slos.latency.current >= slos.latency.target,
        errorRate: slos.errorRate.current <= slos.errorRate.target
      },
      errorBudgetHealth: {
        availability: errorBudgets.availability.consumed < 50 ? 'GREEN' : 
                     errorBudgets.availability.consumed < 80 ? 'YELLOW' : 'RED',
        latency: errorBudgets.latency.consumed < 50 ? 'GREEN' : 
                errorBudgets.latency.consumed < 80 ? 'YELLOW' : 'RED',
        errorRate: errorBudgets.errorRate.consumed < 50 ? 'GREEN' : 
                  errorBudgets.errorRate.consumed < 80 ? 'YELLOW' : 'RED'
      },
      incidents: this.data.incidents.length,
      criticalIssues: this.data.incidents.filter(i => i.severity === 'high' || i.severity === 'critical').length
    };
  }

  /**
   * Generate detailed analysis
   */
  generateDetails() {
    this.report.details = {
      sloPerformance: this.data.slos,
      errorBudgetAnalysis: this.data.errorBudgets,
      criticalUserJourneys: this.data.criticalUserJourneys,
      incidents: this.data.incidents,
      trends: this.analyzeTrends()
    };
  }

  /**
   * Analyze trends
   */
  analyzeTrends() {
    return {
      availability: this.data.slos.availability.trend,
      latency: this.data.slos.latency.trend,
      errorRate: this.data.slos.errorRate.trend,
      errorBudgets: {
        availability: this.data.errorBudgets.availability.trend,
        latency: this.data.errorBudgets.latency.trend,
        errorRate: this.data.errorBudgets.errorRate.trend
      }
    };
  }

  /**
   * Generate recommendations
   */
  generateRecommendations() {
    this.report.recommendations = this.data.recommendations;
  }

  /**
   * Generate markdown report
   */
  generateMarkdown() {
    const { summary, details, recommendations } = this.report;
    
    return `# Weekly SLO Report - ${this.data.week}

**Date Range**: ${this.data.dateRange}  
**Generated**: ${this.report.generated}

## Executive Summary

- **Overall Status**: ${summary.overallStatus}
- **SLO Compliance**: ${Object.values(summary.sloCompliance).every(Boolean) ? '✅ All SLOs met' : '❌ Some SLOs failed'}
- **Error Budget Health**: ${Object.values(summary.errorBudgetHealth).every(status => status === 'GREEN') ? '🟢 All green' : '🟡 Some yellow/red'}
- **Incidents**: ${summary.incidents} (${summary.criticalIssues} critical)

## SLO Performance

### Availability
- **Current**: ${details.sloPerformance.availability.current}%
- **Target**: ${details.sloPerformance.availability.target}%
- **Status**: ${summary.sloCompliance.availability ? '✅ PASS' : '❌ FAIL'}
- **Trend**: ${details.sloPerformance.availability.trend}
- **Downtime**: ${details.sloPerformance.availability.downtime}

### Latency
- **Current**: ${details.sloPerformance.latency.current}% of requests < 500ms
- **Target**: ${details.sloPerformance.latency.target}%
- **Status**: ${summary.sloCompliance.latency ? '✅ PASS' : '❌ FAIL'}
- **Trend**: ${details.sloPerformance.latency.trend}
- **P95**: ${details.sloPerformance.latency.p95}ms
- **P99**: ${details.sloPerformance.latency.p99}ms

### Error Rate
- **Current**: ${details.sloPerformance.errorRate.current}%
- **Target**: ${details.sloPerformance.errorRate.target}%
- **Status**: ${summary.sloCompliance.errorRate ? '✅ PASS' : '❌ FAIL'}
- **Trend**: ${details.sloPerformance.errorRate.trend}
- **Total Errors**: ${details.sloPerformance.errorRate.totalErrors}

## Error Budget Analysis

| Metric | Consumed | Remaining | Status | Trend |
|--------|----------|-----------|--------|-------|
| Availability | ${details.errorBudgetAnalysis.availability.consumed}% | ${details.errorBudgetAnalysis.availability.remaining}% | ${summary.errorBudgetHealth.availability} | ${details.trends.errorBudgets.availability} |
| Latency | ${details.errorBudgetAnalysis.latency.consumed}% | ${details.errorBudgetAnalysis.latency.remaining}% | ${summary.errorBudgetHealth.latency} | ${details.trends.errorBudgets.latency} |
| Error Rate | ${details.errorBudgetAnalysis.errorRate.consumed}% | ${details.errorBudgetAnalysis.errorRate.remaining}% | ${summary.errorBudgetHealth.errorRate} | ${details.trends.errorBudgets.errorRate} |

## Critical User Journeys

| Journey | Success Rate | Avg Time | Failures |
|---------|--------------|----------|----------|
| User Registration | ${details.criticalUserJourneys.userRegistration.successRate}% | ${details.criticalUserJourneys.userRegistration.avgTime}s | ${details.criticalUserJourneys.userRegistration.failures} |
| Meal Generation | ${details.criticalUserJourneys.mealGeneration.successRate}% | ${details.criticalUserJourneys.mealGeneration.avgTime}s | ${details.criticalUserJourneys.mealGeneration.failures} |
| Payment Processing | ${details.criticalUserJourneys.paymentProcessing.successRate}% | ${details.criticalUserJourneys.paymentProcessing.avgTime}s | ${details.criticalUserJourneys.paymentProcessing.failures} |
| Meal Planning | ${details.criticalUserJourneys.mealPlanning.successRate}% | ${details.criticalUserJourneys.mealPlanning.avgTime}s | ${details.criticalUserJourneys.mealPlanning.failures} |
| User Authentication | ${details.criticalUserJourneys.userAuthentication.successRate}% | ${details.criticalUserJourneys.userAuthentication.avgTime}s | ${details.criticalUserJourneys.userAuthentication.failures} |

## Incidents

${details.incidents.length > 0 ? 
  details.incidents.map(incident => 
    `### ${incident.title} (${incident.id})
- **Severity**: ${incident.severity}
- **Duration**: ${incident.duration}
- **Impact**: ${incident.impact}
- **Resolution**: ${incident.resolution}
`).join('\n') : 
  'No incidents reported this week.'
}

## Recommendations

${recommendations.length > 0 ? 
  recommendations.map(rec => `- ${rec}`).join('\n') : 
  'No specific recommendations at this time.'
}

## Next Week's Focus

1. **Monitor**: ${summary.errorBudgetHealth.availability === 'RED' ? 'Availability error budget' : 'System stability'}
2. **Improve**: ${details.trends.latency === 'degrading' ? 'Response times' : 'Performance monitoring'}
3. **Investigate**: ${details.incidents.length > 0 ? 'Recent incidents' : 'Potential issues'}

---
*This report is generated automatically. For questions or concerns, contact the SRE team.*
`;
  }

  /**
   * Save report
   */
  saveReport() {
    const reportsDir = path.join(process.cwd(), 'REPORTS');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const jsonPath = path.join(reportsDir, `slo-weekly-${this.data.week}.json`);
    const mdPath = path.join(reportsDir, `slo-weekly-${this.data.week}.md`);

    // Save JSON data
    fs.writeFileSync(jsonPath, JSON.stringify(this.report, null, 2));

    // Save markdown report
    const markdown = this.generateMarkdown();
    fs.writeFileSync(mdPath, markdown);

    log(`📁 JSON report saved to: ${jsonPath}`, 'blue');
    log(`📁 Markdown report saved to: ${mdPath}`, 'blue');
  }

  /**
   * Display report
   */
  displayReport() {
    log('\n📊 Weekly SLO Report', 'bold');
    log('===================', 'bold');
    log(`Week: ${this.data.week}`, 'blue');
    log(`Date Range: ${this.data.dateRange}`, 'blue');
    log(`Overall Status: ${this.report.summary.overallStatus}`, 'green');
    
    log('\n📈 SLO Performance:', 'blue');
    Object.entries(this.report.summary.sloCompliance).forEach(([slo, passed]) => {
      const status = passed ? '✅ PASS' : '❌ FAIL';
      const color = passed ? 'green' : 'red';
      log(`  ${slo}: ${status}`, color);
    });

    log('\n💰 Error Budget Health:', 'blue');
    Object.entries(this.report.summary.errorBudgetHealth).forEach(([metric, status]) => {
      const emoji = status === 'GREEN' ? '🟢' : status === 'YELLOW' ? '🟡' : '🔴';
      log(`  ${metric}: ${emoji} ${status}`, status === 'GREEN' ? 'green' : status === 'YELLOW' ? 'yellow' : 'red');
    });

    log('\n🚨 Incidents:', 'blue');
    log(`  Total: ${this.report.summary.incidents}`, 'blue');
    log(`  Critical: ${this.report.summary.criticalIssues}`, 'blue');
  }
}

// Main execution
async function main() {
  log('📊 Generating Weekly SLO Report...', 'bold');
  
  const report = new WeeklySLOReport(mockWeeklyData);
  report.generateSummary();
  report.generateDetails();
  report.generateRecommendations();
  report.displayReport();
  report.saveReport();

  log('\n✅ Weekly SLO report generated successfully!', 'green');
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Failed to generate weekly SLO report:', error);
    process.exit(1);
  });
}

module.exports = { WeeklySLOReport };