#!/usr/bin/env tsx
/**
 * Test All Script
 * Runs all tests: dashboards, components, experiments, metrics collection
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

const scripts = [
  { name: 'Test Dashboards', script: 'test-dashboards.ts', required: true },
  { name: 'Test Components', script: 'test-components.ts', required: true },
  { name: 'Run Experiments', script: 'run-experiments.ts', required: false },
  { name: 'Collect Metrics', script: 'collect-metrics.ts', required: false },
];

async function main() {
  console.log('🧪 Running All Tests\n');
  console.log('='.repeat(50));

  const results: Record<string, { passed: boolean; output: string }> = {};

  for (const { name, script, required } of scripts) {
    const scriptPath = join(process.cwd(), 'scripts', script);
    
    if (!existsSync(scriptPath)) {
      console.log(`⚠️ Script not found: ${script}`);
      results[name] = { passed: false, output: 'Script not found' };
      continue;
    }

    console.log(`\n📋 Running: ${name}`);
    console.log('-'.repeat(50));

    try {
      const output = execSync(`tsx ${scriptPath}`, {
        encoding: 'utf-8',
        stdio: 'pipe',
      });
      
      console.log(output);
      results[name] = { passed: true, output };
    } catch (error: any) {
      const output = error.stdout || error.message || 'Unknown error';
      console.log(output);
      results[name] = { passed: false, output };
      
      if (required) {
        console.error(`\n❌ Required test failed: ${name}`);
      } else {
        console.warn(`\n⚠️ Optional test failed: ${name}`);
      }
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Test Summary:');
  
  let allRequiredPassed = true;
  Object.entries(results).forEach(([name, result]) => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${name}: ${status}`);
    if (!result.passed && scripts.find((s) => s.name === name)?.required) {
      allRequiredPassed = false;
    }
  });

  console.log(`\n${allRequiredPassed ? '✅ All required tests passed!' : '❌ Some required tests failed'}`);
  
  // Save results to file
  const resultsPath = join(process.cwd(), 'yc', 'TEST_RESULTS.json');
  const fs = await import('fs');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Results saved to: ${resultsPath}`);

  process.exit(allRequiredPassed ? 0 : 1);
}

main().catch(console.error);
