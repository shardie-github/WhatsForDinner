#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { performance } from 'perf_hooks';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Performance thresholds (in milliseconds)
const THRESHOLDS = {
  p50: 100,   // 50th percentile
  p95: 300,   // 95th percentile
  p99: 500,   // 99th percentile
  max: 1000,  // Maximum allowed
};

// Test queries to measure performance
const TEST_QUERIES = [
  {
    name: 'Simple Select',
    query: () => supabase.from('profiles').select('id').limit(1),
    expectedRows: 1,
  },
  {
    name: 'Complex Join',
    query: () => supabase
      .from('profiles')
      .select(`
        id,
        name,
        tenant_memberships!inner(
          tenant_id,
          role,
          tenants(name, plan)
        )
      `)
      .limit(10),
    expectedRows: 10,
  },
  {
    name: 'Aggregate Query',
    query: () => supabase
      .from('analytics_events')
      .select('event_type, count(*)')
      .group('event_type'),
    expectedRows: 5,
  },
  {
    name: 'Filtered Query',
    query: () => supabase
      .from('recipes')
      .select('id, title, calories')
      .gte('calories', 100)
      .lte('calories', 500)
      .limit(20),
    expectedRows: 20,
  },
  {
    name: 'Insert Operation',
    query: async () => {
      const testData = {
        user_id: 'test-user-' + Date.now(),
        action: 'test_query',
        tokens_used: 0,
        cost_usd: 0,
        model_used: 'test',
        metadata: { test: true }
      };
      const result = await supabase.from('usage_logs').insert(testData).select();
      // Clean up test data
      if (result.data?.[0]?.id) {
        await supabase.from('usage_logs').delete().eq('id', result.data[0].id);
      }
      return result;
    },
    expectedRows: 1,
  },
];

async function measureQueryPerformance(queryFn, queryName) {
  const results = [];
  const iterations = 5; // Run each query 5 times for better accuracy
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    
    try {
      const result = await queryFn();
      const end = performance.now();
      const duration = end - start;
      
      results.push({
        duration,
        success: !result.error,
        error: result.error?.message,
        rowCount: result.data?.length || 0,
      });
    } catch (error) {
      const end = performance.now();
      const duration = end - start;
      
      results.push({
        duration,
        success: false,
        error: error.message,
        rowCount: 0,
      });
    }
  }
  
  return {
    name: queryName,
    results,
    stats: calculateStats(results),
  };
}

function calculateStats(results) {
  const durations = results.map(r => r.duration).sort((a, b) => a - b);
  const successCount = results.filter(r => r.success).length;
  
  return {
    count: durations.length,
    success: successCount,
    successRate: (successCount / durations.length) * 100,
    min: Math.min(...durations),
    max: Math.max(...durations),
    avg: durations.reduce((a, b) => a + b, 0) / durations.length,
    p50: durations[Math.floor(durations.length * 0.5)],
    p95: durations[Math.floor(durations.length * 0.95)],
    p99: durations[Math.floor(durations.length * 0.99)],
  };
}

function checkPerformanceThresholds(stats) {
  const violations = [];
  
  if (stats.p50 > THRESHOLDS.p50) {
    violations.push({
      metric: 'p50',
      value: stats.p50,
      threshold: THRESHOLDS.p50,
      severity: 'warning',
    });
  }
  
  if (stats.p95 > THRESHOLDS.p95) {
    violations.push({
      metric: 'p95',
      value: stats.p95,
      threshold: THRESHOLDS.p95,
      severity: 'error',
    });
  }
  
  if (stats.p99 > THRESHOLDS.p99) {
    violations.push({
      metric: 'p99',
      value: stats.p99,
      threshold: THRESHOLDS.p99,
      severity: 'error',
    });
  }
  
  if (stats.max > THRESHOLDS.max) {
    violations.push({
      metric: 'max',
      value: stats.max,
      threshold: THRESHOLDS.max,
      severity: 'critical',
    });
  }
  
  return violations;
}

function formatDuration(ms) {
  return `${ms.toFixed(2)}ms`;
}

function printReport(queryResults) {
  console.log('\n📊 Database Performance Report');
  console.log('==============================\n');
  
  let totalViolations = 0;
  let criticalViolations = 0;
  
  queryResults.forEach(({ name, stats, violations }) => {
    const status = violations.length === 0 ? '✅' : 
                   violations.some(v => v.severity === 'critical') ? '🚨' : '⚠️';
    
    console.log(`${status} ${name}`);
    console.log(`   Success Rate: ${stats.successRate.toFixed(1)}% (${stats.success}/${stats.count})`);
    console.log(`   Min: ${formatDuration(stats.min)}`);
    console.log(`   Avg: ${formatDuration(stats.avg)}`);
    console.log(`   P50: ${formatDuration(stats.p50)}`);
    console.log(`   P95: ${formatDuration(stats.p95)}`);
    console.log(`   P99: ${formatDuration(stats.p99)}`);
    console.log(`   Max: ${formatDuration(stats.max)}`);
    
    if (violations.length > 0) {
      console.log('   Violations:');
      violations.forEach(violation => {
        const icon = violation.severity === 'critical' ? '🚨' : 
                     violation.severity === 'error' ? '❌' : '⚠️';
        console.log(`     ${icon} ${violation.metric}: ${formatDuration(violation.value)} > ${formatDuration(violation.threshold)}`);
      });
      totalViolations += violations.length;
      criticalViolations += violations.filter(v => v.severity === 'critical').length;
    }
    console.log('');
  });
  
  console.log('📈 Performance Thresholds:');
  console.log(`   P50: ${formatDuration(THRESHOLDS.p50)} (warning)`);
  console.log(`   P95: ${formatDuration(THRESHOLDS.p95)} (error)`);
  console.log(`   P99: ${formatDuration(THRESHOLDS.p99)} (error)`);
  console.log(`   Max: ${formatDuration(THRESHOLDS.max)} (critical)`);
  
  console.log(`\n📊 Summary:`);
  console.log(`   🚨 Critical: ${criticalViolations}`);
  console.log(`   ❌ Errors: ${totalViolations - criticalViolations}`);
  console.log(`   📁 Total Violations: ${totalViolations}`);
  
  return { totalViolations, criticalViolations };
}

async function main() {
  const args = process.argv.slice(2);
  const checkOnly = args.includes('--check');
  
  console.log('🔍 Running database performance tests...');
  
  const queryResults = [];
  
  for (const testQuery of TEST_QUERIES) {
    console.log(`   Testing: ${testQuery.name}...`);
    const result = await measureQueryPerformance(testQuery.query, testQuery.name);
    const violations = checkPerformanceThresholds(result.stats);
    queryResults.push({ ...result, violations });
  }
  
  const { totalViolations, criticalViolations } = printReport(queryResults);
  
  if (checkOnly) {
    if (criticalViolations > 0) {
      console.log('\n❌ Database performance check failed! Critical violations found.');
      process.exit(1);
    } else if (totalViolations > 0) {
      console.log('\n⚠️  Database performance check completed with warnings.');
      process.exit(1);
    } else {
      console.log('\n✅ Database performance check passed!');
    }
  }
}

main().catch(error => {
  console.error('❌ Error running database performance check:', error);
  process.exit(1);
});