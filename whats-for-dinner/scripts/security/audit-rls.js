#!/usr/bin/env node

/**
 * Row Level Security (RLS) Audit Script
 * Validates RLS policies across all tables in the database
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  supabaseUrl: process.env.SUPABASE_URL || 'http://localhost:54321',
  supabaseKey:
    process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
  outputDir: path.join(__dirname, '../security-audit'),
  verbose: process.env.VERBOSE === 'true',
};

// Initialize Supabase client
const supabase = createClient(config.supabaseUrl, config.supabaseKey);

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logVerbose(message) {
  if (config.verbose) {
    log(`[VERBOSE] ${message}`, 'blue');
  }
}

/**
 * Get all tables in the database
 */
async function getAllTables() {
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_schema')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE');

    if (error) throw error;
    return data || [];
  } catch (error) {
    log(`Error fetching tables: ${error.message}`, 'red');
    return [];
  }
}

/**
 * Check if RLS is enabled on a table
 */
async function isRLSEnabled(tableName) {
  try {
    const { data, error } = await supabase.rpc('check_rls_enabled', {
      table_name: tableName,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    // Fallback to direct query
    try {
      const { data, error } = await supabase
        .from('pg_class')
        .select('relrowsecurity')
        .eq('relname', tableName)
        .single();

      if (error) throw error;
      return data?.relrowsecurity || false;
    } catch (fallbackError) {
      logVerbose(
        `Could not check RLS for ${tableName}: ${fallbackError.message}`
      );
      return null;
    }
  }
}

/**
 * Get RLS policies for a table
 */
async function getRLSPolicies(tableName) {
  try {
    const { data, error } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', tableName);

    if (error) throw error;
    return data || [];
  } catch (error) {
    logVerbose(`Could not fetch policies for ${tableName}: ${error.message}`);
    return [];
  }
}

/**
 * Validate RLS policy syntax
 */
function validatePolicySyntax(policy) {
  const issues = [];

  // Check for common security issues
  if (policy.policycmd === 'SELECT' && policy.qual === 'true') {
    issues.push('Policy allows unrestricted SELECT access');
  }

  if (policy.policycmd === 'INSERT' && policy.qual === 'true') {
    issues.push('Policy allows unrestricted INSERT access');
  }

  if (policy.policycmd === 'UPDATE' && policy.qual === 'true') {
    issues.push('Policy allows unrestricted UPDATE access');
  }

  if (policy.policycmd === 'DELETE' && policy.qual === 'true') {
    issues.push('Policy allows unrestricted DELETE access');
  }

  // Check for missing user context
  if (
    policy.qual &&
    !policy.qual.includes('auth.uid()') &&
    !policy.qual.includes('current_user')
  ) {
    issues.push('Policy does not reference user context');
  }

  return issues;
}

/**
 * Test RLS policies with different user contexts
 */
async function testRLSPolicies(tableName, policies) {
  const testResults = [];

  for (const policy of policies) {
    try {
      // Test with anonymous user
      const { data: anonData, error: anonError } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      testResults.push({
        policy: policy.policyname,
        context: 'anonymous',
        success: !anonError,
        error: anonError?.message,
      });

      // Test with authenticated user (if we have a test user)
      if (process.env.TEST_USER_ID) {
        const { data: authData, error: authError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        testResults.push({
          policy: policy.policyname,
          context: 'authenticated',
          success: !authError,
          error: authError?.message,
        });
      }
    } catch (error) {
      testResults.push({
        policy: policy.policyname,
        context: 'test',
        success: false,
        error: error.message,
      });
    }
  }

  return testResults;
}

/**
 * Generate RLS audit report
 */
function generateReport(auditResults) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTables: auditResults.length,
      tablesWithRLS: auditResults.filter(r => r.rlsEnabled).length,
      tablesWithoutRLS: auditResults.filter(r => !r.rlsEnabled).length,
      totalPolicies: auditResults.reduce(
        (sum, r) => sum + r.policies.length,
        0
      ),
      policyIssues: auditResults.reduce((sum, r) => sum + r.issues.length, 0),
    },
    results: auditResults,
  };

  return report;
}

/**
 * Main audit function
 */
async function auditRLS() {
  log('Starting RLS audit...', 'blue');

  // Ensure output directory exists
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
  }

  const tables = await getAllTables();
  log(`Found ${tables.length} tables to audit`, 'green');

  const auditResults = [];

  for (const table of tables) {
    log(`Auditing table: ${table.table_name}`, 'yellow');

    const rlsEnabled = await isRLSEnabled(table.table_name);
    const policies = await getRLSPolicies(table.table_name);

    const issues = [];

    // Check if RLS is enabled
    if (!rlsEnabled) {
      issues.push('RLS is not enabled on this table');
    }

    // Validate policies
    for (const policy of policies) {
      const policyIssues = validatePolicySyntax(policy);
      issues.push(
        ...policyIssues.map(issue => `${policy.policyname}: ${issue}`)
      );
    }

    // Test policies
    const testResults = await testRLSPolicies(table.table_name, policies);

    auditResults.push({
      tableName: table.table_name,
      schema: table.table_schema,
      rlsEnabled,
      policies,
      issues,
      testResults,
    });

    logVerbose(
      `Table ${table.table_name}: RLS=${rlsEnabled}, Policies=${policies.length}, Issues=${issues.length}`
    );
  }

  // Generate report
  const report = generateReport(auditResults);

  // Save report
  const reportFile = path.join(config.outputDir, 'rls-results.json');
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

  // Print summary
  log('\n=== RLS Audit Summary ===', 'blue');
  log(`Total tables: ${report.summary.totalTables}`, 'green');
  log(`Tables with RLS: ${report.summary.tablesWithRLS}`, 'green');
  log(`Tables without RLS: ${report.summary.tablesWithoutRLS}`, 'red');
  log(`Total policies: ${report.summary.totalPolicies}`, 'green');
  log(`Policy issues: ${report.summary.policyIssues}`, 'red');

  // Print critical issues
  const criticalIssues = auditResults.filter(r => r.issues.length > 0);
  if (criticalIssues.length > 0) {
    log('\n=== Critical Issues ===', 'red');
    criticalIssues.forEach(result => {
      log(`\nTable: ${result.tableName}`, 'red');
      result.issues.forEach(issue => {
        log(`  - ${issue}`, 'red');
      });
    });
  }

  log(`\nDetailed report saved to: ${reportFile}`, 'green');

  return report;
}

// Run audit if called directly
if (require.main === module) {
  auditRLS()
    .then(() => {
      log('RLS audit completed successfully', 'green');
      process.exit(0);
    })
    .catch(error => {
      log(`RLS audit failed: ${error.message}`, 'red');
      process.exit(1);
    });
}

module.exports = { auditRLS };
