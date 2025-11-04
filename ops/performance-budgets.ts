/**
 * Performance Budgets - Lighthouse CI + Bundle Analyzer
 * 
 * Budgets: LCP < 2.5s, CLS < 0.1, TBT < 300ms, JS < 170KB
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const REPORTS_DIR = join(process.cwd(), 'ops', 'reports');

interface PerformanceBudget {
  metric: string;
  budget: number;
  actual: number;
  passed: boolean;
}

interface BudgetReport {
  timestamp: string;
  budgets: PerformanceBudget[];
  lighthouse?: any;
  bundle?: any;
}

const BUDGETS = {
  lcp: 2500, // ms
  cls: 0.1,
  tbt: 300, // ms
  jsSize: 170 * 1024, // bytes
};

async function checkBudgets(): Promise<BudgetReport> {
  const report: BudgetReport = {
    timestamp: new Date().toISOString(),
    budgets: []
  };

  // Check Lighthouse metrics
  try {
    const lighthousePath = join(REPORTS_DIR, 'lighthouse.json');
    if (existsSync(lighthousePath)) {
      const lighthouse = JSON.parse(readFileSync(lighthousePath, 'utf-8'));
      report.lighthouse = lighthouse;

      const metrics = lighthouse.audits || {};
      
      // LCP
      if (metrics['largest-contentful-paint']) {
        const lcp = metrics['largest-contentful-paint'].numericValue;
        report.budgets.push({
          metric: 'LCP',
          budget: BUDGETS.lcp,
          actual: lcp,
          passed: lcp < BUDGETS.lcp
        });
      }

      // CLS
      if (metrics['cumulative-layout-shift']) {
        const cls = metrics['cumulative-layout-shift'].numericValue;
        report.budgets.push({
          metric: 'CLS',
          budget: BUDGETS.cls,
          actual: cls,
          passed: cls < BUDGETS.cls
        });
      }

      // TBT
      if (metrics['total-blocking-time']) {
        const tbt = metrics['total-blocking-time'].numericValue;
        report.budgets.push({
          metric: 'TBT',
          budget: BUDGETS.tbt,
          actual: tbt,
          passed: tbt < BUDGETS.tbt
        });
      }
    }
  } catch (error) {
    console.warn('Could not read Lighthouse report:', error);
  }

  // Check bundle size
  try {
    const bundlePath = join(REPORTS_DIR, 'bundle-report.json');
    if (existsSync(bundlePath)) {
      const bundle = JSON.parse(readFileSync(bundlePath, 'utf-8'));
      report.bundle = bundle;

      const totalJS = bundle.totalJS || 0;
      report.budgets.push({
        metric: 'JS Bundle Size',
        budget: BUDGETS.jsSize,
        actual: totalJS,
        passed: totalJS < BUDGETS.jsSize
      });
    }
  } catch (error) {
    console.warn('Could not read bundle report:', error);
  }

  // Save report
  if (!existsSync(REPORTS_DIR)) {
    mkdirSync(REPORTS_DIR, { recursive: true });
  }

  writeFileSync(
    join(REPORTS_DIR, 'performance-budgets.json'),
    JSON.stringify(report, null, 2)
  );

  return report;
}

async function runLighthouseCI(): Promise<void> {
  console.log('Running Lighthouse CI...');
  
  try {
    execSync('lhci autorun', { stdio: 'inherit' });
    console.log('✅ Lighthouse CI completed');
  } catch (error) {
    console.error('❌ Lighthouse CI failed');
    throw error;
  }
}

async function runBundleAnalyzer(): Promise<void> {
  console.log('Running bundle analyzer...');
  
  try {
    execSync('pnpm analyze:bundle', { stdio: 'inherit' });
    console.log('✅ Bundle analysis completed');
  } catch (error) {
    console.error('❌ Bundle analysis failed');
    throw error;
  }
}

if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'check') {
    checkBudgets().then(report => {
      const failed = report.budgets.filter(b => !b.passed);
      console.log('\n📊 Performance Budgets:');
      report.budgets.forEach(budget => {
        const icon = budget.passed ? '✅' : '❌';
        console.log(`${icon} ${budget.metric}: ${budget.actual} (budget: ${budget.budget})`);
      });
      
      if (failed.length > 0) {
        console.error(`\n❌ ${failed.length} budget(s) failed`);
        process.exit(1);
      } else {
        console.log('\n✅ All budgets passed');
      }
    });
  } else if (command === 'lighthouse') {
    runLighthouseCI().catch(error => {
      process.exit(1);
    });
  } else if (command === 'bundle') {
    runBundleAnalyzer().catch(error => {
      process.exit(1);
    });
  } else {
    console.log('Usage: performance-budgets.ts [check|lighthouse|bundle]');
    process.exit(1);
  }
}

export { checkBudgets, runLighthouseCI, runBundleAnalyzer };
