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
        
    try {
      const validation = validateEnvironmentVariables();
      
      if (validation.valid) {
        this.results.environment = { status: 'pass', details: ['All required environment variables are present'] };
              } else {
        this.results.environment = { status: 'fail', details: validation.errors };
                validation.errors.forEach(error => );
      }
    } catch (error) {
      this.results.environment = { status: 'error', details: [error.message] };
          }
  }

  async checkDatabase() {
        
    try {
      // Test basic connectivity
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (error) {
        this.results.database = { status: 'fail', details: [error.message] };
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
          ');
          return;
        }
      }

      this.results.database = { status: 'pass', details: ['Database connectivity successful'] };
          } catch (error) {
      this.results.database = { status: 'error', details: [error.message] };
          }
  }

  async checkRLS() {
        
    try {
      // Test that unauthenticated requests are blocked
      const { data, error } = await supabase
        .from('pantry_items')
        .select('*')
        .limit(1);

      // RLS should either return empty data or an error for unauthenticated requests
      if (error && error.code === 'PGRST301') {
        this.results.rls = { status: 'pass', details: ['RLS is properly blocking unauthenticated requests'] };
              } else if (data && data.length === 0) {
        this.results.rls = { status: 'pass', details: ['RLS is working (empty result for unauthenticated request)'] };
              } else {
        this.results.rls = { status: 'warn', details: ['RLS may not be properly configured'] };
        ');
      }
    } catch (error) {
      this.results.rls = { status: 'error', details: [error.message] };
          }
  }

  async checkEdgeFunctions() {
        
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
          } else if (hasWarnings) {
      this.results.edgeFunctions = { status: 'warn', details: results };
          } else {
      this.results.edgeFunctions = { status: 'pass', details: results };
          }

    results.forEach(result => );
  }

  async checkOverall() {
        
    const statuses = Object.values(this.results).map(r => r.status);
    const hasFailures = statuses.includes('fail') || statuses.includes('error');
    const hasWarnings = statuses.includes('warn');

    if (hasFailures) {
      this.results.overall = { status: 'fail', details: ['Health check failed - critical issues found'] };
          } else if (hasWarnings) {
      this.results.overall = { status: 'warn', details: ['Health check passed with warnings'] };
          } else {
      this.results.overall = { status: 'pass', details: ['All health checks passed'] };
          }
  }

  async runAllChecks() {
        
    await this.checkEnvironment();
        
    await this.checkDatabase();
        
    await this.checkRLS();
        
    await this.checkEdgeFunctions();
        
    await this.checkOverall();
    
    // Summary
            Object.entries(this.results).forEach(([check, result]) => {
      const icon = result.status === 'pass' ? '✅' : result.status === 'warn' ? '⚠️' : '❌';
      }: ${result.status.toUpperCase()}`);
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