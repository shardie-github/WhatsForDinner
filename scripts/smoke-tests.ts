/**
 * Smoke Test Script
 * 
 * Runs critical path smoke tests to verify system health
 */

import { runHealthCheck } from '@whats-for-dinner/utils';
import { createComponentLogger } from '@whats-for-dinner/utils';

const logger = createComponentLogger('smoke-tests');

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

const results: TestResult[] = [];

async function runTest(name: string, testFn: () => Promise<void>): Promise<TestResult> {
  const start = Date.now();
  try {
    await testFn();
    const duration = Date.now() - start;
    logger.info(`✅ ${name} passed`, { duration });
    return { name, passed: true, duration };
  } catch (error) {
    const duration = Date.now() - start;
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`❌ ${name} failed`, { error: errorMessage, duration });
    return { name, passed: false, error: errorMessage, duration };
  }
}

/**
 * Test 1: Health Check Endpoints
 */
async function testHealthChecks() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  // Test full health check
  const healthResponse = await fetch(`${baseUrl}/api/health`);
  if (!healthResponse.ok) {
    throw new Error(`Health check failed: ${healthResponse.status}`);
  }
  const health = await healthResponse.json();
  if (health.status === 'unhealthy') {
    throw new Error('Health check returned unhealthy status');
  }
  
  // Test liveness probe
  const liveResponse = await fetch(`${baseUrl}/api/health/live`);
  if (!liveResponse.ok) {
    throw new Error(`Liveness probe failed: ${liveResponse.status}`);
  }
  
  // Test readiness probe
  const readyResponse = await fetch(`${baseUrl}/api/health/ready`);
  if (!readyResponse.ok) {
    throw new Error(`Readiness probe failed: ${readyResponse.status}`);
  }
}

/**
 * Test 2: Health Check Utility
 */
async function testHealthCheckUtility() {
  const health = await runHealthCheck({ checkTimeout: 5000 });
  
  if (health.status === 'unhealthy') {
    throw new Error('Health check utility returned unhealthy status');
  }
  
  // Verify required checks exist
  const requiredChecks = ['database', 'externalAPIs', 'memory'];
  for (const check of requiredChecks) {
    if (!health.checks[check]) {
      throw new Error(`Missing required check: ${check}`);
    }
  }
}

/**
 * Test 3: Logger Functionality
 */
async function testLogger() {
  const testLogger = createComponentLogger('smoke-test');
  
  // Test all log levels
  testLogger.debug('Debug test');
  testLogger.info('Info test');
  testLogger.warn('Warn test');
  testLogger.error('Error test', { test: true });
  
  // If we get here without throwing, logger works
}

/**
 * Main smoke test runner
 */
async function runSmokeTests() {
  logger.info('Starting smoke tests...');
  
  // Run tests
  results.push(await runTest('Health Check Endpoints', testHealthChecks));
  results.push(await runTest('Health Check Utility', testHealthCheckUtility));
  results.push(await runTest('Logger Functionality', testLogger));
  
  // Summary
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  
  logger.info('Smoke tests completed', {
    passed,
    failed,
    total: results.length,
    totalDuration,
  });
  
  // Print results
  logger.info('\n=== Smoke Test Results ===');
  results.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    logger.info('${status} ${result.name} (${result.duration}ms')`);
    if (result.error) {
      logger.info('   Error: ${result.error}');
    }
  });
  logger.info('\nTotal: ${passed}/${results.length} passed in ${totalDuration}ms\n');
  
  // Exit with error code if any tests failed
  if (failed > 0) {
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  runSmokeTests().catch(error => {
    logger.error('Smoke tests failed', { error });
    process.exit(1);
  });
}

export { runSmokeTests };
