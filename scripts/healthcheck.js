#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const { performance } = require('perf_hooks');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkDatabaseHealth() {
  const start = performance.now();
  
  try {
    // Test basic connectivity
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    const duration = performance.now() - start;
    
    if (error) {
      return {
        status: 'error',
        message: 'Database connection failed',
        error: error.message,
        duration: Math.round(duration)
      };
    }
    
    return {
      status: 'healthy',
      message: 'Database connection successful',
      duration: Math.round(duration),
      rowCount: data?.length || 0
    };
  } catch (err) {
    const duration = performance.now() - start;
    return {
      status: 'error',
      message: 'Database connection failed',
      error: err.message,
      duration: Math.round(duration)
    };
  }
}

async function checkSystemHealth() {
  const checks = {
    database: await checkDatabaseHealth(),
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    buildSha: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
    environment: process.env.NODE_ENV || 'development'
  };
  
  const overallStatus = checks.database.status === 'healthy' ? 'healthy' : 'unhealthy';
  
  return {
    status: overallStatus,
    checks,
    uptime: process.uptime()
  };
}

function printHealthReport(healthData) {
  console.log('\n🏥 Health Check Report');
  console.log('======================\n');
  
  const status = healthData.status === 'healthy' ? '✅' : '❌';
  console.log(`${status} Overall Status: ${healthData.status.toUpperCase()}`);
  console.log(`   Environment: ${healthData.checks.environment}`);
  console.log(`   Version: ${healthData.checks.version}`);
  console.log(`   Build SHA: ${healthData.checks.buildSha}`);
  console.log(`   Uptime: ${Math.round(healthData.uptime)}s`);
  console.log('');
  
  // Database check
  const dbStatus = healthData.checks.database.status === 'healthy' ? '✅' : '❌';
  console.log(`${dbStatus} Database: ${healthData.checks.database.status}`);
  console.log(`   Message: ${healthData.checks.database.message}`);
  console.log(`   Duration: ${healthData.checks.database.duration}ms`);
  
  if (healthData.checks.database.error) {
    console.log(`   Error: ${healthData.checks.database.error}`);
  }
  
  if (healthData.checks.database.rowCount !== undefined) {
    console.log(`   Rows returned: ${healthData.checks.database.rowCount}`);
  }
  
  console.log('');
  console.log(`🕐 Check completed at: ${healthData.checks.timestamp}`);
}

function generateJsonOutput(healthData) {
  return JSON.stringify(healthData, null, 2);
}

async function main() {
  const args = process.argv.slice(2);
  const jsonOutput = args.includes('--json');
  const checkOnly = args.includes('--check');
  
  try {
    const healthData = await checkSystemHealth();
    
    if (jsonOutput) {
      console.log(generateJsonOutput(healthData));
    } else {
      printHealthReport(healthData);
    }
    
    if (checkOnly) {
      if (healthData.status !== 'healthy') {
        console.log('\n❌ Health check failed!');
        process.exit(1);
      } else {
        console.log('\n✅ Health check passed!');
      }
    }
  } catch (error) {
    console.error('❌ Error running health check:', error);
    process.exit(1);
  }
}

main();