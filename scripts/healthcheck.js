#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const { performance } = require('perf_hooks');

// Use unified secrets manager with fallback to process.env
let SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY;

// Try to load from secrets manager (async would be better, but keeping sync for now)
try {
  const { secretsManager } = require('./secrets-manager-unified.mjs');
  // For sync scripts, we'll use process.env as fallback
  // TODO: Refactor to async to use secretsManager.getSecret()
  SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
} catch (e) {
  // Fallback to process.env
  SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables');
  console.error('   Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  console.error('   Or ensure secrets are in Supabase secrets_vault');
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
      
  const status = healthData.status === 'healthy' ? '✅' : '❌';
  }`);
        }s`);
    
  // Database check
  const dbStatus = healthData.checks.database.status === 'healthy' ? '✅' : '❌';
        
  if (healthData.checks.database.error) {
      }
  
  if (healthData.checks.database.rowCount !== undefined) {
      }
  
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
      );
    } else {
      printHealthReport(healthData);
    }
    
    if (checkOnly) {
      if (healthData.status !== 'healthy') {
                process.exit(1);
      } else {
              }
    }
  } catch (error) {
    console.error('❌ Error running health check:', error);
    process.exit(1);
  }
}

main();