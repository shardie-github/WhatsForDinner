/**
 * Example Benchmark
 * 
 * Demonstrates how to write benchmarks for performance-critical functions.
 */

import { runSuite, type BenchmarkSuite } from './runner';
import { createComponentLogger } from '@whats-for-dinner/utils';

// Example function to benchmark
const logger = createComponentLogger('example-bench-ts');
function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

function fibonacciMemoized(n: number, memo: Map<number, number> = new Map()): number {
  if (n <= 1) return n;
  if (memo.has(n)) return memo.get(n)!;
  const result = fibonacciMemoized(n - 1, memo) + fibonacciMemoized(n - 2, memo);
  memo.set(n, result);
  return result;
}

// Define benchmark suite
const suite: BenchmarkSuite = {
  name: 'Fibonacci Performance',
  benchmarks: [
    {
      name: 'fibonacci(30) - recursive',
      fn: () => {
        fibonacci(30);
      },
      iterations: 10, // Fewer iterations for slow function
    },
    {
      name: 'fibonacci(30) - memoized',
      fn: () => {
        fibonacciMemoized(30);
      },
      iterations: 1000,
    },
  ],
};

// Run benchmarks (if executed directly)
if (require.main === module) {
  runSuite(suite)
    .then((results) => {
      logger.info('\nBenchmark complete!');
      logger.info(JSON.stringify(results, null, 2));
    })
    .catch((error) => {
      logger.error('Benchmark failed:', { error });
      process.exit(1);
    });
}

export default suite;
