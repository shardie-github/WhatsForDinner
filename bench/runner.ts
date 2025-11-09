/**
 * Microbenchmark Runner
 * 
 * Lightweight benchmarking harness for performance-critical functions.
 * Runs benchmarks and tracks trends over time.
 */

export interface BenchmarkResult {
  name: string;
  iterations: number;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  opsPerSecond: number;
  timestamp: string;
}

export interface BenchmarkSuite {
  name: string;
  benchmarks: Benchmark[];
}

export interface Benchmark {
  name: string;
  fn: () => void | Promise<void>;
  iterations?: number;
  warmup?: number;
}

const DEFAULT_ITERATIONS = 1000;
const DEFAULT_WARMUP = 10;

/**
 * Run a single benchmark
 */
export async function runBenchmark(benchmark: Benchmark): Promise<BenchmarkResult> {
  const iterations = benchmark.iterations ?? DEFAULT_ITERATIONS;
  const warmup = benchmark.warmup ?? DEFAULT_WARMUP;

  // Warmup
  for (let i = 0; i < warmup; i++) {
    await benchmark.fn();
  }

  // Run benchmark
  const times: number[] = [];
  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    const iterStart = performance.now();
    await benchmark.fn();
    const iterEnd = performance.now();
    times.push(iterEnd - iterStart);
  }

  const end = performance.now();
  const totalTime = end - start;
  const averageTime = totalTime / iterations;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const opsPerSecond = 1000 / averageTime;

  return {
    name: benchmark.name,
    iterations,
    totalTime,
    averageTime,
    minTime,
    maxTime,
    opsPerSecond,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Run a suite of benchmarks
 */
export async function runSuite(suite: BenchmarkSuite): Promise<BenchmarkResult[]> {
  const results: BenchmarkResult[] = [];

  console.log(`\nRunning benchmark suite: ${suite.name}`);
  console.log('─'.repeat(50));

  for (const benchmark of suite.benchmarks) {
    const result = await runBenchmark(benchmark);
    results.push(result);

    console.log(`${result.name}:`);
    console.log(`  Iterations: ${result.iterations}`);
    console.log(`  Average: ${result.averageTime.toFixed(4)}ms`);
    console.log(`  Min: ${result.minTime.toFixed(4)}ms`);
    console.log(`  Max: ${result.maxTime.toFixed(4)}ms`);
    console.log(`  Ops/sec: ${result.opsPerSecond.toFixed(2)}`);
    console.log('');
  }

  return results;
}

/**
 * Compare benchmark results
 */
export function compareResults(
  baseline: BenchmarkResult,
  current: BenchmarkResult
): {
  name: string;
  change: number;
  changePercent: number;
  faster: boolean;
} {
  const change = current.averageTime - baseline.averageTime;
  const changePercent = (change / baseline.averageTime) * 100;
  const faster = change < 0;

  return {
    name: current.name,
    change,
    changePercent,
    faster,
  };
}

/**
 * Format benchmark results as JSON
 */
export function formatResults(results: BenchmarkResult[]): string {
  return JSON.stringify(results, null, 2);
}

/**
 * Save benchmark results to file
 */
export async function saveResults(
  results: BenchmarkResult[],
  filepath: string
): Promise<void> {
  const fs = await import('fs/promises');
  await fs.writeFile(filepath, formatResults(results), 'utf-8');
}
