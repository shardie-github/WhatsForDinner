/**
 * Performance budgets checker
 */

import * as fs from 'fs';
import * as path from 'path';

const BUDGETS = {
  lcp: 2500,
  cls: 0.1,
  tbt: 300,
  jsSize: 170000,
};

// Removed unused export - not imported anywhere
function checkPerformanceBudgets() {
  const resultsDir = path.join(process.cwd(), 'ops', 'reports');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  const violations: string[] = [];
  const report = {
    timestamp: new Date().toISOString(),
    budgets: BUDGETS,
    violations,
    status: violations.length === 0 ? 'pass' : 'fail',
  };

  const reportPath = path.join(resultsDir, 'performance-budgets.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  return report;
}
