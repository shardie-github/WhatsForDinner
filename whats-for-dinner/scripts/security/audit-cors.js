#!/usr/bin/env node

/**
 * CORS Configuration Audit Script
 * Validates CORS settings across all endpoints and functions
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Configuration
const config = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  supabaseUrl: process.env.SUPABASE_URL || 'http://localhost:54321',
  outputDir: path.join(__dirname, '../security-audit'),
  verbose: process.env.VERBOSE === 'true',
  timeout: 5000,
};

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
 * Test CORS configuration for a given URL
 */
async function testCORS(url, method = 'GET') {
  return new Promise(resolve => {
    const options = {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://malicious-site.com',
        'Access-Control-Request-Method': method,
        'Access-Control-Request-Headers': 'Content-Type,Authorization',
      },
      timeout: config.timeout,
    };

    const protocol = url.startsWith('https') ? https : http;

    const req = protocol.request(url, options, res => {
      const corsHeaders = {
        'Access-Control-Allow-Origin':
          res.headers['access-control-allow-origin'],
        'Access-Control-Allow-Methods':
          res.headers['access-control-allow-methods'],
        'Access-Control-Allow-Headers':
          res.headers['access-control-allow-headers'],
        'Access-Control-Allow-Credentials':
          res.headers['access-control-allow-credentials'],
        'Access-Control-Max-Age': res.headers['access-control-max-age'],
      };

      resolve({
        url,
        method,
        statusCode: res.statusCode,
        corsHeaders,
        issues: validateCORSHeaders(corsHeaders),
      });
    });

    req.on('error', error => {
      resolve({
        url,
        method,
        statusCode: 0,
        corsHeaders: {},
        issues: [`Connection error: ${error.message}`],
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        url,
        method,
        statusCode: 0,
        corsHeaders: {},
        issues: ['Request timeout'],
      });
    });

    req.end();
  });
}

/**
 * Validate CORS headers for security issues
 */
function validateCORSHeaders(headers) {
  const issues = [];

  // Check for wildcard origin
  if (headers['Access-Control-Allow-Origin'] === '*') {
    issues.push('Wildcard origin (*) allows any domain to make requests');
  }

  // Check for wildcard with credentials
  if (
    headers['Access-Control-Allow-Origin'] === '*' &&
    headers['Access-Control-Allow-Credentials'] === 'true'
  ) {
    issues.push('Wildcard origin with credentials is not allowed by browsers');
  }

  // Check for missing origin validation
  if (!headers['Access-Control-Allow-Origin']) {
    issues.push('No Access-Control-Allow-Origin header found');
  }

  // Check for overly permissive methods
  if (
    headers['Access-Control-Allow-Methods'] &&
    headers['Access-Control-Allow-Methods'].includes('*')
  ) {
    issues.push('Wildcard methods (*) allows any HTTP method');
  }

  // Check for missing methods
  if (!headers['Access-Control-Allow-Methods']) {
    issues.push('No Access-Control-Allow-Methods header found');
  }

  // Check for overly permissive headers
  if (
    headers['Access-Control-Allow-Headers'] &&
    headers['Access-Control-Allow-Headers'].includes('*')
  ) {
    issues.push('Wildcard headers (*) allows any request header');
  }

  // Check for missing headers
  if (!headers['Access-Control-Allow-Headers']) {
    issues.push('No Access-Control-Allow-Headers header found');
  }

  // Check for missing max-age
  if (!headers['Access-Control-Max-Age']) {
    issues.push('No Access-Control-Max-Age header found (preflight caching)');
  }

  return issues;
}

/**
 * Test CORS for Supabase Edge Functions
 */
async function testSupabaseFunctions() {
  const functions = ['api', 'generate-meal', 'job-processor'];
  const results = [];

  for (const func of functions) {
    const url = `${config.supabaseUrl}/functions/v1/${func}`;
    logVerbose(`Testing Supabase function: ${func}`);

    const result = await testCORS(url, 'POST');
    results.push({
      ...result,
      type: 'supabase-function',
      function: func,
    });
  }

  return results;
}

/**
 * Test CORS for Next.js API routes
 */
async function testAPIRoutes() {
  const routes = [
    '/api/auth/callback',
    '/api/meals',
    '/api/ingredients',
    '/api/recipes',
    '/api/analytics',
  ];

  const results = [];

  for (const route of routes) {
    const url = `${config.baseUrl}${route}`;
    logVerbose(`Testing API route: ${route}`);

    const result = await testCORS(url, 'GET');
    results.push({
      ...result,
      type: 'api-route',
      route: route,
    });
  }

  return results;
}

/**
 * Test CORS for static assets
 */
async function testStaticAssets() {
  const assets = [
    '/_next/static/chunks/main.js',
    '/_next/static/css/main.css',
    '/favicon.ico',
  ];

  const results = [];

  for (const asset of assets) {
    const url = `${config.baseUrl}${asset}`;
    logVerbose(`Testing static asset: ${asset}`);

    const result = await testCORS(url, 'GET');
    results.push({
      ...result,
      type: 'static-asset',
      asset: asset,
    });
  }

  return results;
}

/**
 * Test CORS for external domains
 */
async function testExternalDomains() {
  const domains = [
    'https://api.openai.com',
    'https://api.stripe.com',
    'https://api.posthog.com',
  ];

  const results = [];

  for (const domain of domains) {
    logVerbose(`Testing external domain: ${domain}`);

    const result = await testCORS(domain, 'GET');
    results.push({
      ...result,
      type: 'external-domain',
      domain: domain,
    });
  }

  return results;
}

/**
 * Generate CORS audit report
 */
function generateReport(results) {
  const totalTests = results.length;
  const failedTests = results.filter(r => r.statusCode === 0).length;
  const testsWithIssues = results.filter(r => r.issues.length > 0).length;
  const criticalIssues = results.filter(r =>
    r.issues.some(
      issue =>
        issue.includes('Wildcard') ||
        issue.includes('credentials') ||
        issue.includes('any domain')
    )
  ).length;

  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests,
      failedTests,
      testsWithIssues,
      criticalIssues,
      successRate:
        (((totalTests - failedTests) / totalTests) * 100).toFixed(2) + '%',
    },
    results: results,
  };

  return report;
}

/**
 * Main audit function
 */
async function auditCORS() {
  log('Starting CORS audit...', 'blue');

  // Ensure output directory exists
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
  }

  const results = [];

  // Test Supabase functions
  log('Testing Supabase Edge Functions...', 'yellow');
  const functionResults = await testSupabaseFunctions();
  results.push(...functionResults);

  // Test API routes
  log('Testing Next.js API routes...', 'yellow');
  const apiResults = await testAPIRoutes();
  results.push(...apiResults);

  // Test static assets
  log('Testing static assets...', 'yellow');
  const assetResults = await testStaticAssets();
  results.push(...assetResults);

  // Test external domains
  log('Testing external domains...', 'yellow');
  const externalResults = await testExternalDomains();
  results.push(...externalResults);

  // Generate report
  const report = generateReport(results);

  // Save report
  const reportFile = path.join(config.outputDir, 'cors-results.json');
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

  // Print summary
  log('\n=== CORS Audit Summary ===', 'blue');
  log(`Total tests: ${report.summary.totalTests}`, 'green');
  log(`Failed tests: ${report.summary.failedTests}`, 'red');
  log(`Tests with issues: ${report.summary.testsWithIssues}`, 'yellow');
  log(`Critical issues: ${report.summary.criticalIssues}`, 'red');
  log(`Success rate: ${report.summary.successRate}`, 'green');

  // Print critical issues
  const criticalResults = results.filter(r =>
    r.issues.some(
      issue =>
        issue.includes('Wildcard') ||
        issue.includes('credentials') ||
        issue.includes('any domain')
    )
  );

  if (criticalResults.length > 0) {
    log('\n=== Critical CORS Issues ===', 'red');
    criticalResults.forEach(result => {
      log(`\n${result.type}: ${result.url}`, 'red');
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
  auditCORS()
    .then(() => {
      log('CORS audit completed successfully', 'green');
      process.exit(0);
    })
    .catch(error => {
      log(`CORS audit failed: ${error.message}`, 'red');
      process.exit(1);
    });
}

module.exports = { auditCORS };
