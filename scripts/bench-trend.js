#!/usr/bin/env node
/**
 * Benchmark Trend Analyzer
 * 
 * Compares current benchmark results with historical baseline
 * and generates trend reports.
 */

const fs = require('fs');
const path = require('path');

const BENCH_DIR = path.join(__dirname, '..', 'bench');
const HISTORY_DIR = path.join(BENCH_DIR, 'history');
const RESULTS_FILE = path.join(BENCH_DIR, 'results.json');

/**
 * Load benchmark results from file
 */
function loadResults(filepath) {
  if (!fs.existsSync(filepath)) {
    return null;
  }
  try {
    const content = fs.readFileSync(filepath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error loading results from ${filepath}:`, error.message);
    return null;
  }
}

/**
 * Get latest baseline from history
 */
function getLatestBaseline() {
  if (!fs.existsSync(HISTORY_DIR)) {
    return null;
  }

  const files = fs.readdirSync(HISTORY_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => ({
      name: f,
      path: path.join(HISTORY_DIR, f),
      date: f.replace('.json', ''),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));

  if (files.length === 0) {
    return null;
  }

  return loadResults(files[0].path);
}

/**
 * Compare results and calculate trends
 */
function compareResults(baseline, current) {
  const trends = [];

  for (const currentResult of current) {
    const baselineResult = baseline.find(b => b.name === currentResult.name);
    
    if (!baselineResult) {
      trends.push({
        name: currentResult.name,
        status: 'new',
        message: 'New benchmark',
      });
      continue;
    }

    const change = currentResult.averageTime - baselineResult.averageTime;
    const changePercent = (change / baselineResult.averageTime) * 100;
    const faster = change < 0;

    let status = 'stable';
    if (Math.abs(changePercent) > 10) {
      status = faster ? 'improved' : 'regressed';
    }

    trends.push({
      name: currentResult.name,
      status,
      change,
      changePercent: Math.abs(changePercent),
      faster,
      baseline: baselineResult.averageTime,
      current: currentResult.averageTime,
    });
  }

  return trends;
}

/**
 * Generate trend report
 */
function generateReport(trends) {
  console.log('\n📊 Benchmark Trend Report');
  console.log('═'.repeat(60));

  const improved = trends.filter(t => t.status === 'improved');
  const regressed = trends.filter(t => t.status === 'regressed');
  const stable = trends.filter(t => t.status === 'stable');
  const newBenchmarks = trends.filter(t => t.status === 'new');

  if (improved.length > 0) {
    console.log('\n✅ Improved:');
    improved.forEach(t => {
      console.log(`  ${t.name}: ${t.changePercent.toFixed(2)}% faster (${t.baseline.toFixed(4)}ms → ${t.current.toFixed(4)}ms)`);
    });
  }

  if (regressed.length > 0) {
    console.log('\n⚠️  Regressed:');
    regressed.forEach(t => {
      console.log(`  ${t.name}: ${t.changePercent.toFixed(2)}% slower (${t.baseline.toFixed(4)}ms → ${t.current.toFixed(4)}ms)`);
    });
  }

  if (stable.length > 0) {
    console.log('\n➡️  Stable:');
    stable.forEach(t => {
      console.log(`  ${t.name}: ${t.changePercent.toFixed(2)}% change (within threshold)`);
    });
  }

  if (newBenchmarks.length > 0) {
    console.log('\n🆕 New Benchmarks:');
    newBenchmarks.forEach(t => {
      console.log(`  ${t.name}`);
    });
  }

  console.log('\n' + '═'.repeat(60));
  console.log(`Total: ${trends.length} benchmarks`);
  console.log(`Improved: ${improved.length} | Regressed: ${regressed.length} | Stable: ${stable.length} | New: ${newBenchmarks.length}`);

  // Exit with error code if regressions found
  if (regressed.length > 0) {
    console.log('\n❌ Performance regressions detected!');
    process.exit(1);
  }
}

/**
 * Main execution
 */
function main() {
  const current = loadResults(RESULTS_FILE);
  
  if (!current) {
    console.log('No current benchmark results found. Run benchmarks first.');
    process.exit(0);
  }

  const baseline = getLatestBaseline();

  if (!baseline) {
    console.log('No baseline found. This will serve as the baseline.');
    console.log('Saving current results as baseline...');
    
    // Create history directory if it doesn't exist
    if (!fs.existsSync(HISTORY_DIR)) {
      fs.mkdirSync(HISTORY_DIR, { recursive: true });
    }

    // Save as baseline
    const today = new Date().toISOString().split('T')[0];
    const baselinePath = path.join(HISTORY_DIR, `${today}.json`);
    fs.writeFileSync(baselinePath, JSON.stringify(current, null, 2));
    
    console.log(`Baseline saved to ${baselinePath}`);
    process.exit(0);
  }

  const trends = compareResults(baseline, current);
  generateReport(trends);

  // Save trend report
  const reportPath = path.join(BENCH_DIR, 'trend-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(trends, null, 2));
  console.log(`\nTrend report saved to ${reportPath}`);
}

if (require.main === module) {
  main();
}

module.exports = { compareResults, generateReport };
