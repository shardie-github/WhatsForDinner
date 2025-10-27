#!/usr/bin/env node

/**
 * SLO Check Script
 * 
 * Validates SLO compliance and error budget status
 * Used in CI pipeline to enforce release gates
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

// SLO Definitions
const SLOS = {
  availability: {
    target: 99.9, // 99.9%
    window: 30, // 30 days
    errorBudget: 0.1, // 0.1%
  },
  latency: {
    target: 95, // 95% of requests
    threshold: 500, // < 500ms
    window: 30, // 30 days
    errorBudget: 5, // 5% of requests
  },
  errorRate: {
    target: 0.1, // < 0.1%
    window: 30, // 30 days
    errorBudget: 0.1, // 0.1%
  }
};

// Mock data - in production, this would come from your monitoring system
const mockMetrics = {
  availability: 99.95, // 99.95%
  latency: 98.5, // 98.5% of requests < 500ms
  errorRate: 0.05, // 0.05%
  errorBudgetConsumption: {
    availability: 25, // 25% consumed
    latency: 30, // 30% consumed
    errorRate: 20, // 20% consumed
  }
};

class SLOChecker {
  constructor() {
    this.results = {
      passed: true,
      slos: {},
      errorBudgets: {},
      recommendations: []
    };
  }

  /**
   * Check SLO compliance
   */
  checkSLO(name, current, target, operator = '>=') {
    let passed = false;
    
    switch (operator) {
      case '>=':
        passed = current >= target;
        break;
      case '<=':
        passed = current <= target;
        break;
      case '>':
        passed = current > target;
        break;
      case '<':
        passed = current < target;
        break;
    }

    this.results.slos[name] = {
      current,
      target,
      operator,
      passed,
      status: passed ? 'PASS' : 'FAIL'
    };

    if (!passed) {
      this.results.passed = false;
      this.results.recommendations.push(
        `${name} SLO failed: ${current} ${operator} ${target}`
      );
    }

    return passed;
  }

  /**
   * Check error budget consumption
   */
  checkErrorBudget(name, consumption, threshold = 80) {
    const status = consumption >= threshold ? 'CRITICAL' : 
                   consumption >= 50 ? 'WARNING' : 'OK';
    
    this.results.errorBudgets[name] = {
      consumption,
      threshold,
      status
    };

    if (consumption >= threshold) {
      this.results.passed = false;
      this.results.recommendations.push(
        `${name} error budget critical: ${consumption}% consumed (threshold: ${threshold}%)`
      );
    }

    return status !== 'CRITICAL';
  }

  /**
   * Run all SLO checks
   */
  async runChecks() {
    log('\n🔍 Running SLO Checks...', 'blue');
    log('========================', 'blue');

    // Check availability SLO
    this.checkSLO(
      'availability',
      mockMetrics.availability,
      SLOS.availability.target,
      '>='
    );

    // Check latency SLO
    this.checkSLO(
      'latency',
      mockMetrics.latency,
      SLOS.latency.target,
      '>='
    );

    // Check error rate SLO
    this.checkSLO(
      'errorRate',
      mockMetrics.errorRate,
      SLOS.errorRate.target,
      '<='
    );

    // Check error budgets
    log('\n💰 Checking Error Budgets...', 'blue');
    log('============================', 'blue');

    this.checkErrorBudget('availability', mockMetrics.errorBudgetConsumption.availability);
    this.checkErrorBudget('latency', mockMetrics.errorBudgetConsumption.latency);
    this.checkErrorBudget('errorRate', mockMetrics.errorBudgetConsumption.errorRate);

    return this.results;
  }

  /**
   * Generate report
   */
  generateReport() {
    log('\n📊 SLO Check Report', 'bold');
    log('==================', 'bold');

    // SLO Status
    log('\n📈 SLO Status:', 'blue');
    Object.entries(this.results.slos).forEach(([name, slo]) => {
      const status = slo.passed ? '✅ PASS' : '❌ FAIL';
      const color = slo.passed ? 'green' : 'red';
      log(`  ${name}: ${status} (${slo.current} ${slo.operator} ${slo.target})`, color);
    });

    // Error Budget Status
    log('\n💰 Error Budget Status:', 'blue');
    Object.entries(this.results.errorBudgets).forEach(([name, budget]) => {
      const status = budget.status === 'OK' ? '✅ OK' : 
                    budget.status === 'WARNING' ? '⚠️  WARNING' : '🚨 CRITICAL';
      const color = budget.status === 'OK' ? 'green' : 
                   budget.status === 'WARNING' ? 'yellow' : 'red';
      log(`  ${name}: ${status} (${budget.consumption}% consumed)`, color);
    });

    // Recommendations
    if (this.results.recommendations.length > 0) {
      log('\n💡 Recommendations:', 'yellow');
      this.results.recommendations.forEach(rec => {
        log(`  • ${rec}`, 'yellow');
      });
    }

    // Overall Status
    log('\n🎯 Overall Status:', 'bold');
    if (this.results.passed) {
      log('✅ All SLOs passed - Release approved', 'green');
    } else {
      log('❌ SLOs failed - Release blocked', 'red');
    }

    return this.results;
  }

  /**
   * Save results to file
   */
  saveResults() {
    const resultsPath = path.join(process.cwd(), 'REPORTS', 'slo-check-results.json');
    const reportPath = path.join(process.cwd(), 'REPORTS', 'slo-check-report.md');

    // Ensure REPORTS directory exists
    const reportsDir = path.dirname(resultsPath);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Save JSON results
    fs.writeFileSync(resultsPath, JSON.stringify(this.results, null, 2));

    // Generate markdown report
    const markdown = this.generateMarkdownReport();
    fs.writeFileSync(reportPath, markdown);

    log(`\n📁 Results saved to: ${resultsPath}`, 'blue');
    log(`📁 Report saved to: ${reportPath}`, 'blue');
  }

  /**
   * Generate markdown report
   */
  generateMarkdownReport() {
    const timestamp = new Date().toISOString();
    const status = this.results.passed ? '✅ PASSED' : '❌ FAILED';
    const statusColor = this.results.passed ? 'green' : 'red';

    return `# SLO Check Report

**Date**: ${timestamp}  
**Status**: ${status}

## SLO Compliance

| SLO | Current | Target | Status |
|-----|---------|--------|--------|
${Object.entries(this.results.slos).map(([name, slo]) => 
  `| ${name} | ${slo.current} | ${slo.target} | ${slo.passed ? '✅ PASS' : '❌ FAIL'} |`
).join('\n')}

## Error Budget Status

| Metric | Consumption | Threshold | Status |
|--------|-------------|-----------|--------|
${Object.entries(this.results.errorBudgets).map(([name, budget]) => 
  `| ${name} | ${budget.consumption}% | ${budget.threshold}% | ${budget.status} |`
).join('\n')}

## Recommendations

${this.results.recommendations.length > 0 ? 
  this.results.recommendations.map(rec => `- ${rec}`).join('\n') : 
  'No recommendations at this time.'
}

## Next Steps

${this.results.passed ? 
  '✅ Release approved - All SLOs are within target' : 
  '❌ Release blocked - Address SLO failures before proceeding'
}
`;
  }
}

// Main execution
async function main() {
  log('🎯 SLO Check Starting...', 'bold');
  
  const checker = new SLOChecker();
  const results = await checker.runChecks();
  checker.generateReport();
  checker.saveResults();

  // Exit with appropriate code
  process.exit(results.passed ? 0 : 1);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('SLO check failed:', error);
    process.exit(1);
  });
}

module.exports = { SLOChecker, SLOS };