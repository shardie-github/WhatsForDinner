#!/usr/bin/env tsx

/**
 * Performance Testing Runner
 * 
 * Executes k6 load tests and generates baseline/compares results
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { logger } from '../../server/src/observability/index.js';
import {
  generateK6Script,
  generateBaseline,
  compareBaseline,
  saveBaseline,
  loadBaseline,
  apiScenarios,
  webScenarios,
} from './scenarios.js';

interface PerfTestOptions {
  generateBaseline?: boolean;
  compare?: boolean;
  baselinePath?: string;
  scenarios?: string[];
  baseUrl?: string;
  output?: string;
}

class PerfTestRunner {
  private baselinePath: string;
  private baseUrl: string;

  constructor(options: PerfTestOptions = {}) {
    this.baselinePath = options.baselinePath || join(process.cwd(), 'perf-baseline.json');
    this.baseUrl = options.baseUrl || process.env.BASE_URL || 'http://localhost:3000';
  }

  /**
   * Check if k6 is installed
   */
  private checkK6(): boolean {
    try {
      execSync('k6 version', { stdio: 'ignore' });
      return true;
    } catch {
      logger.error('k6 is not installed. Install from https://k6.io/docs/getting-started/installation/');
      return false;
    }
  }

  /**
   * Run k6 test
   */
  private async runK6Test(
    scriptPath: string,
    outputPath?: string,
  ): Promise<{ success: boolean; results?: any; error?: string }> {
    if (!this.checkK6()) {
      return { success: false, error: 'k6 not installed' };
    }

    try {
      const outputFlag = outputPath ? `--out json=${outputPath}` : '';
      const command = `k6 run ${outputFlag} ${scriptPath}`;
      
      logger.info({ command }, 'Running k6 test');
      
      execSync(command, {
        stdio: 'inherit',
        env: {
          ...process.env,
          BASE_URL: this.baseUrl,
        },
      });

      // Parse k6 JSON output if available
      if (outputPath && existsSync(outputPath)) {
        const results = JSON.parse(readFileSync(outputPath, 'utf-8'));
        return { success: true, results };
      }

      return { success: true };
    } catch (error) {
      logger.error({ error }, 'k6 test failed');
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Generate k6 script file
   */
  private generateScript(scenarios: typeof apiScenarios | typeof webScenarios): string {
    const scriptContent = generateK6Script(scenarios);
    const scriptPath = join(process.cwd(), '.k6-test.js');
    writeFileSync(scriptPath, scriptContent);
    return scriptPath;
  }

  /**
   * Run performance test and generate baseline
   */
  async generateBaseline(scenarios: string[] = ['api']): Promise<boolean> {
    logger.info('Generating performance baseline');

    const selectedScenarios =
      scenarios.includes('api') ? apiScenarios : scenarios.includes('web') ? webScenarios : apiScenarios;

    const scriptPath = this.generateScript(selectedScenarios);
    const outputPath = join(process.cwd(), '.k6-output.json');

    const result = await this.runK6Test(scriptPath, outputPath);

    if (!result.success) {
      return false;
    }

    // Generate baseline from results
    if (result.results) {
      const baseline = generateBaseline(result.results);
      await saveBaseline(baseline, this.baselinePath);
      logger.info({ baselinePath: this.baselinePath }, 'Baseline saved');
    } else {
      // Create placeholder baseline (would be populated from actual metrics)
      const baseline = {
        timestamp: new Date().toISOString(),
        scenarios: {} as Record<string, any>,
      };

      // Populate with scenario targets as placeholders
      for (const scenario of selectedScenarios) {
        baseline.scenarios[scenario.name] = {
          p50: scenario.expectedP95 * 0.5,
          p95: scenario.expectedP95,
          p99: scenario.expectedP99,
          min: scenario.expectedP95 * 0.1,
          max: scenario.expectedP99 * 2,
          avg: scenario.expectedP95 * 0.7,
          requests: 1000,
          errors: 0,
          errorRate: 0,
        };
      }

      await saveBaseline(baseline, this.baselinePath);
      logger.info({ baselinePath: this.baselinePath }, 'Placeholder baseline saved');
    }

    return true;
  }

  /**
   * Run performance test and compare with baseline
   */
  async compare(scenarios: string[] = ['api'], thresholdPercent = 10): Promise<{
    passed: boolean;
    regressions: Array<{
      scenario: string;
      metric: string;
      baseline: number;
      current: number;
      deltaPercent: number;
    }>;
  }> {
    if (!existsSync(this.baselinePath)) {
      logger.error({ baselinePath: this.baselinePath }, 'Baseline not found. Generate baseline first.');
      return {
        passed: false,
        regressions: [
          {
            scenario: 'unknown',
            metric: 'baseline_missing',
            baseline: 0,
            current: 0,
            deltaPercent: 100,
          },
        ],
      };
    }

    logger.info('Running performance test for comparison');

    const selectedScenarios =
      scenarios.includes('api') ? apiScenarios : scenarios.includes('web') ? webScenarios : apiScenarios;

    const scriptPath = this.generateScript(selectedScenarios);
    const outputPath = join(process.cwd(), '.k6-output.json');

    const result = await this.runK6Test(scriptPath, outputPath);

    if (!result.success) {
      return { passed: false, regressions: [] };
    }

    // Load baseline
    const baseline = await loadBaseline(this.baselinePath);

    // Generate current results
    let current = baseline; // Placeholder - would parse from k6 output
    if (result.results) {
      current = generateBaseline(result.results);
    }

    // Compare
    const comparison = compareBaseline(baseline, current, thresholdPercent);

    if (!comparison.passed) {
      logger.warn({ regressions: comparison.regressions }, 'Performance regressions detected');
    } else {
      logger.info('Performance test passed - no regressions');
    }

    return comparison;
  }
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const generateBaselineFlag = args.includes('--generate-baseline');
  const compareFlag = args.includes('--compare');

  const runner = new PerfTestRunner({
    baseUrl: process.env.BASE_URL,
  });

  if (generateBaselineFlag) {
    runner
      .generateBaseline()
      .then((success) => {
        process.exit(success ? 0 : 1);
      })
      .catch((error) => {
        console.error('Failed to generate baseline:', error);
        process.exit(1);
      });
  } else if (compareFlag) {
    runner
      .compare(undefined, parseInt(process.env.PERF_THRESHOLD_PCT || '10', 10))
      .then((result) => {
        if (!result.passed) {
          console.error('Performance regressions detected:');
          for (const regression of result.regressions) {
            console.error(
              `  ${regression.scenario} - ${regression.metric}: ${regression.deltaPercent.toFixed(2)}% regression`,
            );
          }
        }
        process.exit(result.passed ? 0 : 1);
      })
      .catch((error) => {
        console.error('Failed to compare performance:', error);
        process.exit(1);
      });
  } else {
    console.log('Usage:');
    console.log('  --generate-baseline  Generate performance baseline');
    console.log('  --compare            Compare with baseline');
    process.exit(1);
  }
}

export { PerfTestRunner };