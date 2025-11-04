/**
 * Benchmark command
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export async function runBenchmark(options: { save?: boolean; compare?: boolean }) {
  console.log('⚡ Running performance benchmarks...\n');

  const resultsDir = path.join(process.cwd(), 'ops', 'reports');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  const baselineFile = path.join(resultsDir, 'benchmark-baseline.json');

  try {
    // Run Lighthouse CI
    console.log('1️⃣ Running Lighthouse CI...');
    execSync('pnpm performance:lighthouse', { stdio: 'inherit' });

    // Run bundle analyzer
    console.log('\n2️⃣ Analyzing bundle size...');
    execSync('pnpm analyze:bundle', { stdio: 'inherit' });

    // Run performance budgets
    console.log('\n3️⃣ Checking performance budgets...');
    execSync('pnpm performance:budget', { stdio: 'inherit' });

    if (options.save) {
      const results = {
        timestamp: new Date().toISOString(),
        lighthouse: 'lighthouse.json',
        bundle: 'bundle-report.json',
      };
      fs.writeFileSync(baselineFile, JSON.stringify(results, null, 2));
      console.log(`\n✅ Baseline saved: ${baselineFile}`);
    }

    if (options.compare && fs.existsSync(baselineFile)) {
      console.log('\n4️⃣ Comparing with baseline...');
      const baseline = JSON.parse(fs.readFileSync(baselineFile, 'utf-8'));
      console.log(`   Baseline: ${baseline.timestamp}`);
      console.log('   ⚠️  Comparison not yet fully implemented');
    }

    console.log('\n✅ Benchmarks complete!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Benchmarks failed');
    process.exit(1);
  }
}
