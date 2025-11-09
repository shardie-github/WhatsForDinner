#!/usr/bin/env node
/**
 * Benchmark Trend Analyzer
 * 
 * Compares current benchmark results with historical data
 * to detect performance regressions.
 */

const fs = require('fs').promises;
const path = require('path');

const BENCH_DIR = path.join(__dirname, '../bench');
const HISTORY_DIR = path.join(__dirname, '../bench/history');
const THRESHOLD_PERCENT = 10; // Alert if performance degrades by 10%

async function loadLatestBaseline() {
  try {
    const files = await fs.readdir(HISTORY_DIR);
    const jsonFiles = files
      .filter((f) => f.endsWith('.json'))
      .sort()
      .reverse();

    if (jsonFiles.length === 0) {
      console.log('No baseline found. This will be the baseline.');
      return null;
    }

    const latest = jsonFiles[0];
    const content = await fs.readFile(path.join(HISTORY_DIR, latest), 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(HISTORY_DIR, { recursive: true });
      return null;
    }
    throw error;
  }
}

async function loadCurrentResults() {
  const resultFile = path.join(BENCH_DIR, 'results.json');
  try {
    const content = await fs.readFile(resultFile, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('No current results found. Run benchmarks first.');
    throw error;
  }
}

function compareResults(baseline, current) {
  const comparisons = [];

  for (const currentResult of current) {
    const baselineResult = baseline?.find((b) => b.name === currentResult.name);

    if (!baselineResult) {
      comparisons.push({
        name: currentResult.name,
        status: 'new',
        message: 'New benchmark (no baseline)',
      });
      continue;
    }

    const changePercent =
      ((currentResult.averageTime - baselineResult.averageTime) /
        baselineResult.averageTime) *
      100;
    const isRegression = changePercent > THRESHOLD_PERCENT;
    const isImprovement = changePercent < -THRESHOLD_PERCENT;

    comparisons.push({
      name: currentResult.name,
      status: isRegression ? 'regression' : isImprovement ? 'improvement' : 'stable',
      changePercent: changePercent.toFixed(2),
      baselineTime: baselineResult.averageTime.toFixed(4),
      currentTime: currentResult.averageTime.toFixed(4),
      message: isRegression
        ? `⚠️  Performance regression: ${changePercent.toFixed(2)}% slower`
        : isImprovement
        ? `✅ Performance improvement: ${Math.abs(changePercent).toFixed(2)}% faster`
        : `✓ Stable: ${changePercent.toFixed(2)}% change`,
    });
  }

  return comparisons;
}

async function saveBaseline(results) {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = path.join(HISTORY_DIR, `${timestamp}.json`);
  await fs.writeFile(filename, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`\nBaseline saved to ${filename}`);
}

async function main() {
  try {
    const baseline = await loadLatestBaseline();
    const current = await loadCurrentResults();

    console.log('\n📊 Benchmark Trend Analysis');
    console.log('═'.repeat(60));

    const comparisons = compareResults(baseline, current);

    let hasRegression = false;

    for (const comp of comparisons) {
      console.log(`\n${comp.name}:`);
      console.log(`  ${comp.message}`);
      if (comp.baselineTime) {
        console.log(`  Baseline: ${comp.baselineTime}ms`);
        console.log(`  Current:  ${comp.currentTime}ms`);
      }

      if (comp.status === 'regression') {
        hasRegression = true;
      }
    }

    console.log('\n' + '═'.repeat(60));

    if (hasRegression) {
      console.log('\n⚠️  Performance regressions detected!');
      process.exit(1);
    } else {
      console.log('\n✅ No performance regressions detected.');
      // Save current results as new baseline
      await saveBaseline(current);
    }
  } catch (error) {
    console.error('Error analyzing trends:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { compareResults, loadLatestBaseline, loadCurrentResults };
