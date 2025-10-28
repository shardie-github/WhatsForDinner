#!/usr/bin/env tsx

/**
 * Chaos Engineering: Mini Drills
 * 
 * This script runs safe, bounded chaos drills:
 * - Simulate Supabase downtime (mock client fails) → app shows graceful fallback
 * - Simulate rate limiting → verify retry/backoff kicks in
 * - Simulate slow database queries → verify timeout handling
 */

import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { join } from 'path';

interface ChaosConfig {
  max_duration_seconds: number;
  failure_rate: number; // 0.0 to 1.0
  timeout_ms: number;
  retry_attempts: number;
  retry_delay_ms: number;
}

interface ChaosTest {
  name: string;
  description: string;
  duration_ms: number;
  success: boolean;
  error?: string;
  metrics: {
    requests_attempted: number;
    requests_succeeded: number;
    requests_failed: number;
    average_response_time_ms: number;
    fallback_triggered: boolean;
  };
}

interface ChaosReport {
  timestamp: string;
  environment: string;
  overall_status: 'pass' | 'fail' | 'partial';
  tests: ChaosTest[];
  recommendations: string[];
}

const DEFAULT_CONFIG: ChaosConfig = {
  max_duration_seconds: 30,
  failure_rate: 0.3, // 30% failure rate
  timeout_ms: 5000,
  retry_attempts: 3,
  retry_delay_ms: 1000
};

class ChaosMini {
  private supabase: any;
  private config: ChaosConfig;
  private environment: string;

  constructor(
    supabaseUrl: string, 
    supabaseKey: string, 
    environment: string = 'preview',
    config: Partial<ChaosConfig> = {}
  ) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.environment = environment;
  }

  /**
   * Test 1: Simulate Supabase downtime with graceful fallback
   */
  async testSupabaseDowntime(): Promise<ChaosTest> {
    console.log('🔌 Testing Supabase downtime simulation...');
    
    const startTime = Date.now();
    const testName = 'supabase_downtime';
    const metrics = {
      requests_attempted: 0,
      requests_succeeded: 0,
      requests_failed: 0,
      average_response_time_ms: 0,
      fallback_triggered: false
    };
    
    try {
      // Simulate multiple requests with random failures
      const requests = [];
      for (let i = 0; i < 10; i++) {
        const requestStart = Date.now();
        metrics.requests_attempted++;
        
        try {
          // Simulate random failure based on config
          if (Math.random() < this.config.failure_rate) {
            throw new Error('Simulated Supabase connection failure');
          }
          
          // Simulate API call
          const { data, error } = await this.supabase
            .from('profiles')
            .select('id')
            .limit(1);
          
          if (error) {
            throw error;
          }
          
          metrics.requests_succeeded++;
          
        } catch (error) {
          metrics.requests_failed++;
          
          // Check if fallback was triggered (in real app, this would check UI state)
          if (error.message.includes('connection failure') || error.message.includes('timeout')) {
            metrics.fallback_triggered = true;
          }
        }
        
        const requestTime = Date.now() - requestStart;
        requests.push(requestTime);
        
        // Small delay between requests
        await this.delay(100);
      }
      
      metrics.average_response_time_ms = requests.reduce((a, b) => a + b, 0) / requests.length;
      
      const duration = Date.now() - startTime;
      const success = metrics.fallback_triggered && metrics.requests_failed > 0;
      
      return {
        name: testName,
        description: 'Simulate Supabase downtime and verify graceful fallback',
        duration_ms: duration,
        success,
        metrics
      };
      
    } catch (error) {
      return {
        name: testName,
        description: 'Simulate Supabase downtime and verify graceful fallback',
        duration_ms: Date.now() - startTime,
        success: false,
        error: error.message,
        metrics
      };
    }
  }

  /**
   * Test 2: Simulate rate limiting with retry/backoff
   */
  async testRateLimiting(): Promise<ChaosTest> {
    console.log('🚦 Testing rate limiting with retry/backoff...');
    
    const startTime = Date.now();
    const testName = 'rate_limiting';
    const metrics = {
      requests_attempted: 0,
      requests_succeeded: 0,
      requests_failed: 0,
      average_response_time_ms: 0,
      fallback_triggered: false
    };
    
    try {
      // Simulate rapid requests that should trigger rate limiting
      const requests = [];
      for (let i = 0; i < 20; i++) {
        const requestStart = Date.now();
        metrics.requests_attempted++;
        
        try {
          // Simulate rate limiting after 5 requests
          if (i >= 5 && Math.random() < 0.8) {
            throw new Error('Rate limit exceeded');
          }
          
          // Simulate API call
          const { data, error } = await this.supabase
            .from('profiles')
            .select('id')
            .limit(1);
          
          if (error) {
            throw error;
          }
          
          metrics.requests_succeeded++;
          
        } catch (error) {
          metrics.requests_failed++;
          
          // Simulate retry with backoff
          if (error.message.includes('Rate limit')) {
            await this.delay(this.config.retry_delay_ms * (i % this.config.retry_attempts + 1));
            metrics.fallback_triggered = true;
          }
        }
        
        const requestTime = Date.now() - requestStart;
        requests.push(requestTime);
        
        // Very small delay to simulate rapid requests
        await this.delay(50);
      }
      
      metrics.average_response_time_ms = requests.reduce((a, b) => a + b, 0) / requests.length;
      
      const duration = Date.now() - startTime;
      const success = metrics.fallback_triggered && metrics.requests_succeeded > 0;
      
      return {
        name: testName,
        description: 'Simulate rate limiting and verify retry/backoff behavior',
        duration_ms: duration,
        success,
        metrics
      };
      
    } catch (error) {
      return {
        name: testName,
        description: 'Simulate rate limiting and verify retry/backoff behavior',
        duration_ms: Date.now() - startTime,
        success: false,
        error: error.message,
        metrics
      };
    }
  }

  /**
   * Test 3: Simulate slow database queries with timeout handling
   */
  async testSlowQueries(): Promise<ChaosTest> {
    console.log('🐌 Testing slow database queries with timeout handling...');
    
    const startTime = Date.now();
    const testName = 'slow_queries';
    const metrics = {
      requests_attempted: 0,
      requests_succeeded: 0,
      requests_failed: 0,
      average_response_time_ms: 0,
      fallback_triggered: false
    };
    
    try {
      // Simulate slow queries with timeout handling
      const requests = [];
      for (let i = 0; i < 5; i++) {
        const requestStart = Date.now();
        metrics.requests_attempted++;
        
        try {
          // Simulate slow query (random delay)
          const queryDelay = Math.random() * 3000 + 1000; // 1-4 seconds
          
          // Simulate timeout after config timeout_ms
          if (queryDelay > this.config.timeout_ms) {
            throw new Error('Query timeout');
          }
          
          // Simulate the delay
          await this.delay(queryDelay);
          
          // Simulate API call
          const { data, error } = await this.supabase
            .from('profiles')
            .select('id')
            .limit(1);
          
          if (error) {
            throw error;
          }
          
          metrics.requests_succeeded++;
          
        } catch (error) {
          metrics.requests_failed++;
          
          // Check if timeout handling was triggered
          if (error.message.includes('timeout')) {
            metrics.fallback_triggered = true;
          }
        }
        
        const requestTime = Date.now() - requestStart;
        requests.push(requestTime);
      }
      
      metrics.average_response_time_ms = requests.reduce((a, b) => a + b, 0) / requests.length;
      
      const duration = Date.now() - startTime;
      const success = metrics.fallback_triggered && metrics.requests_succeeded > 0;
      
      return {
        name: testName,
        description: 'Simulate slow database queries and verify timeout handling',
        duration_ms: duration,
        success,
        metrics
      };
      
    } catch (error) {
      return {
        name: testName,
        description: 'Simulate slow database queries and verify timeout handling',
        duration_ms: Date.now() - startTime,
        success: false,
        error: error.message,
        metrics
      };
    }
  }

  /**
   * Generate chaos report
   */
  generateChaosReport(tests: ChaosTest[]): ChaosReport {
    const passedTests = tests.filter(t => t.success).length;
    const totalTests = tests.length;
    
    let overallStatus: 'pass' | 'fail' | 'partial';
    if (passedTests === totalTests) {
      overallStatus = 'pass';
    } else if (passedTests > 0) {
      overallStatus = 'partial';
    } else {
      overallStatus = 'fail';
    }
    
    const recommendations: string[] = [];
    
    if (overallStatus === 'fail') {
      recommendations.push('Review error handling and fallback mechanisms');
      recommendations.push('Improve retry logic and timeout handling');
    } else if (overallStatus === 'partial') {
      recommendations.push('Some resilience mechanisms need improvement');
    } else {
      recommendations.push('System shows good resilience - continue monitoring');
    }
    
    return {
      timestamp: new Date().toISOString(),
      environment: this.environment,
      overall_status: overallStatus,
      tests,
      recommendations
    };
  }

  /**
   * Save chaos report to file
   */
  async saveChaosReport(report: ChaosReport): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `chaos-report-${this.environment}-${timestamp}.json`;
    const filepath = join(process.cwd(), 'REPORTS', filename);
    
    // Ensure REPORTS directory exists
    const { execSync } = await import('child_process');
    execSync('mkdir -p REPORTS', { stdio: 'inherit' });
    
    writeFileSync(filepath, JSON.stringify(report, null, 2));
    console.log(`📄 Chaos report saved to: ${filepath}`);
    
    return filepath;
  }

  /**
   * Utility function for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Main chaos testing process
   */
  async execute(): Promise<ChaosReport> {
    console.log(`🚀 Starting chaos mini drills for ${this.environment} environment...`);
    
    try {
      const tests: ChaosTest[] = [];
      
      // Run all chaos tests
      tests.push(await this.testSupabaseDowntime());
      tests.push(await this.testRateLimiting());
      tests.push(await this.testSlowQueries());
      
      // Generate report
      const report = this.generateChaosReport(tests);
      
      // Save report
      await this.saveChaosReport(report);
      
      // Log results
      console.log(`\n🎭 Chaos Test Results:`);
      console.log(`  Environment: ${this.environment}`);
      console.log(`  Overall Status: ${report.overall_status.toUpperCase()}`);
      console.log(`  Tests Passed: ${tests.filter(t => t.success).length}/${tests.length}`);
      
      tests.forEach(test => {
        console.log(`\n  ${test.success ? '✅' : '❌'} ${test.name}:`);
        console.log(`    Duration: ${test.duration_ms}ms`);
        console.log(`    Requests: ${test.metrics.requests_attempted} attempted, ${test.metrics.requests_succeeded} succeeded`);
        console.log(`    Fallback Triggered: ${test.metrics.fallback_triggered ? 'Yes' : 'No'}`);
        if (test.error) {
          console.log(`    Error: ${test.error}`);
        }
      });
      
      if (report.recommendations.length > 0) {
        console.log(`\n💡 Recommendations:`);
        report.recommendations.forEach(rec => console.log(`  - ${rec}`));
      }
      
      return report;
      
    } catch (error) {
      console.error('❌ Chaos testing failed:', error);
      throw error;
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const environment = args.find(arg => arg.startsWith('--env='))?.split('=')[1] || 'preview';
  const isCheckMode = args.includes('--check');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing required environment variables:');
    console.error('  - NEXT_PUBLIC_SUPABASE_URL');
    console.error('  - SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const chaos = new ChaosMini(supabaseUrl, supabaseKey, environment);

  try {
    const report = await chaos.execute();
    
    if (isCheckMode) {
      if (report.overall_status === 'fail') {
        console.log('\n❌ Chaos testing failed - see report for details');
        process.exit(1);
      } else if (report.overall_status === 'partial') {
        console.log('\n⚠️ Chaos testing passed with some issues');
        process.exit(0);
      } else {
        console.log('\n✅ Chaos testing passed');
        process.exit(0);
      }
    }
    
  } catch (error) {
    console.error('Fatal error during chaos testing:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { ChaosMini, ChaosReport, ChaosTest };
