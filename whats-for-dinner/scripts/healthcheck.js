#!/usr/bin/env node

/**
 * Comprehensive Health Check Script
 * 
 * This script performs end-to-end health checks for:
 * - Environment variables
 * - Database connectivity
 * - Supabase services
 * - Edge functions
 * - RLS policies
 */

const { createClient } = require('@supabase/supabase-js');
const { validateEnvironmentVariables } = require('../src/lib/secretsManager.ts');

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing required Supabase configuration');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = SUPABASE_SERVICE_ROLE_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

class HealthChecker {
  constructor() {
    this.results = {
      environment: { status: 'pending', details: [] },
      database: { status: 'pending', details: [] },
      rls: { status: 'pending', details: [] },
      edgeFunctions: { status: 'pending', details: [] },
      overall: { status: 'pending', details: [] }
    };
  }

  async checkEnvironment() {
    console.log('🔍 Checking environment variables...');
    
    try {
      const validation = validateEnvironmentVariables();
      
      if (validation.valid) {
        this.results.environment = { status: 'pass', details: ['All required environment variables are present'] };
        console.log('✅ Environment variables: PASS');
      } else {
        this.results.environment = { status: 'fail', details: validation.errors };
        console.log('❌ Environment variables: FAIL');
        validation.errors.forEach(error => console.log(`   - ${error}`));
      }
    } catch (error) {
      this.results.environment = { status: 'error', details: [error.message] };
      console.log('❌ Environment check error:', error.message);
    }
  }

  async checkDatabase() {
    console.log('🗄️  Checking database connectivity...');
    
    try {
      // Test basic connectivity
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (error) {
        this.results.database = { status: 'fail', details: [error.message] };
        console.log('❌ Database connectivity: FAIL');
        console.log(`   - ${error.message}`);
        return;
      }

      // Test admin connectivity if available
      if (supabaseAdmin) {
        const { data: adminData, error: adminError } = await supabaseAdmin
          .from('profiles')
          .select('count')
          .limit(1);

        if (adminError) {
          this.results.database = { status: 'warn', details: ['Basic connectivity works, but admin access failed'] };
          console.log('⚠️  Database connectivity: WARN (admin access failed)');
          return;
        }
      }

      this.results.database = { status: 'pass', details: ['Database connectivity successful'] };
      console.log('✅ Database connectivity: PASS');
    } catch (error) {
      this.results.database = { status: 'error', details: [error.message] };
      console.log('❌ Database check error:', error.message);
    }
  }

  async checkRLS() {
    console.log('🔒 Checking RLS policies...');
    
    try {
      // Test that unauthenticated requests are blocked
      const { data, error } = await supabase
        .from('pantry_items')
        .select('*')
        .limit(1);

      // RLS should either return empty data or an error for unauthenticated requests
      if (error && error.code === 'PGRST301') {
        this.results.rls = { status: 'pass', details: ['RLS is properly blocking unauthenticated requests'] };
        console.log('✅ RLS policies: PASS');
      } else if (data && data.length === 0) {
        this.results.rls = { status: 'pass', details: ['RLS is working (empty result for unauthenticated request)'] };
        console.log('✅ RLS policies: PASS');
      } else {
        this.results.rls = { status: 'warn', details: ['RLS may not be properly configured'] };
        console.log('⚠️  RLS policies: WARN (unexpected response)');
      }
    } catch (error) {
      this.results.rls = { status: 'error', details: [error.message] };
      console.log('❌ RLS check error:', error.message);
    }
  }

  async checkEdgeFunctions() {
    console.log('⚡ Checking Edge Functions...');
    
    const functions = ['api', 'generate-meal', 'job-processor'];
    const results = [];

    for (const func of functions) {
      try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/${func}`, {
          method: 'OPTIONS',
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          results.push(`✅ ${func}: accessible`);
        } else {
          results.push(`⚠️  ${func}: status ${response.status}`);
        }
      } catch (error) {
        results.push(`❌ ${func}: ${error.message}`);
      }
    }

    const hasErrors = results.some(r => r.includes('❌'));
    const hasWarnings = results.some(r => r.includes('⚠️'));

    if (hasErrors) {
      this.results.edgeFunctions = { status: 'fail', details: results };
      console.log('❌ Edge Functions: FAIL');
    } else if (hasWarnings) {
      this.results.edgeFunctions = { status: 'warn', details: results };
      console.log('⚠️  Edge Functions: WARN');
    } else {
      this.results.edgeFunctions = { status: 'pass', details: results };
      console.log('✅ Edge Functions: PASS');
    }

    results.forEach(result => console.log(`   ${result}`));
  }

  async checkOverall() {
    console.log('📊 Overall health assessment...');
    
    const statuses = Object.values(this.results).map(r => r.status);
    const hasFailures = statuses.includes('fail') || statuses.includes('error');
    const hasWarnings = statuses.includes('warn');

    if (hasFailures) {
      this.results.overall = { status: 'fail', details: ['Health check failed - critical issues found'] };
      console.log('❌ Overall Health: FAIL');
    } else if (hasWarnings) {
      this.results.overall = { status: 'warn', details: ['Health check passed with warnings'] };
      console.log('⚠️  Overall Health: WARN');
    } else {
      this.results.overall = { status: 'pass', details: ['All health checks passed'] };
      console.log('✅ Overall Health: PASS');
    }
  }

  async runAllChecks() {
    console.log('🏥 Starting comprehensive health check...\n');
    
    await this.checkEnvironment();
    console.log('');
    
    await this.checkDatabase();
    console.log('');
    
    await this.checkRLS();
    console.log('');
    
    await this.checkEdgeFunctions();
    console.log('');
    
    await this.checkOverall();
    console.log('');

    // Summary
    console.log('📋 Health Check Summary:');
    console.log('========================');
    Object.entries(this.results).forEach(([check, result]) => {
      const icon = result.status === 'pass' ? '✅' : result.status === 'warn' ? '⚠️' : '❌';
      console.log(`${icon} ${check.toUpperCase()}: ${result.status.toUpperCase()}`);
    });

    // Exit with appropriate code
    const exitCode = this.results.overall.status === 'pass' ? 0 : 1;
    process.exit(exitCode);
  }
}

// Run health check if this script is executed directly
if (require.main === module) {
  const checker = new HealthChecker();
  checker.runAllChecks().catch(error => {
    console.error('❌ Health check failed:', error);
    process.exit(1);
  });
}

module.exports = HealthChecker;