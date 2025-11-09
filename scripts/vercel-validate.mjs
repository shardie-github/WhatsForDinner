#!/usr/bin/env node
/**
 * Vercel Validation Script
 * Validates security headers, health endpoint, and preview protections
 */

import assert from 'node:assert/strict';

const base = process.env.VALIDATE_BASE_URL || 'http://localhost:3000';
const isPreview = process.env.VERCEL_ENV === 'preview' || base.includes('-git-') || base.includes('-vercel.app');

console.log(`🔍 Validating Vercel deployment at: ${base}`);
console.log(`📦 Environment: ${isPreview ? 'PREVIEW' : 'PRODUCTION'}\n`);

let errors = [];
let warnings = [];

// 1. Health endpoint check
try {
  console.log('1️⃣  Checking /api/health endpoint...');
  const healthResp = await fetch(`${base}/api/health`, { method: 'GET' });
  assert.equal(healthResp.status, 200, 'Health endpoint should return 200');
  const healthData = await healthResp.json();
  assert.ok(healthData.ok === true, 'Health response should have ok: true');
  console.log('   ✅ Health endpoint OK\n');
} catch (error) {
  errors.push(`Health endpoint failed: ${error.message}`);
  console.log(`   ❌ Health endpoint failed: ${error.message}\n`);
}

// 2. Security headers check
try {
  console.log('2️⃣  Checking security headers...');
  const homeResp = await fetch(`${base}/`, { method: 'HEAD' });
  const requiredHeaders = [
    'strict-transport-security',
    'x-frame-options',
    'x-content-type-options',
    'content-security-policy',
  ];
  
  const missingHeaders = [];
  for (const header of requiredHeaders) {
    const value = homeResp.headers.get(header);
    if (!value) {
      missingHeaders.push(header);
    }
  }
  
  if (missingHeaders.length > 0) {
    throw new Error(`Missing headers: ${missingHeaders.join(', ')}`);
  }
  
  console.log('   ✅ All security headers present');
  console.log(`   📋 CSP: ${homeResp.headers.get('content-security-policy')?.substring(0, 60)}...\n`);
} catch (error) {
  errors.push(`Security headers check failed: ${error.message}`);
  console.log(`   ❌ Security headers check failed: ${error.message}\n`);
}

// 3. Preview-specific checks
if (isPreview) {
  console.log('3️⃣  Checking preview environment protections...');
  
  // Check robots.txt disallows indexing
  try {
    const robotsResp = await fetch(`${base}/robots.txt`, { method: 'GET' });
    if (robotsResp.ok) {
      const robotsText = await robotsResp.text();
      if (!robotsText.includes('Disallow: /')) {
        warnings.push('robots.txt should disallow indexing in preview');
        console.log('   ⚠️  robots.txt may allow indexing (warning only)\n');
      } else {
        console.log('   ✅ robots.txt disallows indexing\n');
      }
    }
  } catch (error) {
    warnings.push(`Could not check robots.txt: ${error.message}`);
  }
  
  // Check preview banner header
  try {
    const previewResp = await fetch(`${base}/`, { method: 'HEAD' });
    const previewHeader = previewResp.headers.get('x-preview-env');
    if (previewHeader === 'true') {
      console.log('   ✅ Preview environment header present\n');
    } else {
      warnings.push('X-Preview-Env header not found');
      console.log('   ⚠️  Preview environment header not found (warning only)\n');
    }
  } catch (error) {
    warnings.push(`Could not check preview header: ${error.message}`);
  }
  
  // Check admin path protection (if ADMIN_BASIC_AUTH is configured)
  if (process.env.ADMIN_BASIC_AUTH) {
    try {
      console.log('4️⃣  Checking admin path protection...');
      const adminResp = await fetch(`${base}/admin`, { method: 'GET' });
      if (adminResp.status !== 401) {
        warnings.push('Admin path should return 401 when unauthenticated');
        console.log(`   ⚠️  Admin path returned ${adminResp.status} (expected 401)\n`);
      } else {
        console.log('   ✅ Admin path protected (401 returned)\n');
      }
    } catch (error) {
      warnings.push(`Could not check admin protection: ${error.message}`);
    }
  }
}

// Summary
console.log('\n' + '='.repeat(50));
if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ Vercel validation PASSED');
  process.exit(0);
} else {
  if (errors.length > 0) {
    console.log(`❌ Vercel validation FAILED (${errors.length} error(s))`);
    errors.forEach(err => console.log(`   - ${err}`));
  }
  if (warnings.length > 0) {
    console.log(`\n⚠️  Warnings (${warnings.length}):`);
    warnings.forEach(warn => console.log(`   - ${warn}`));
  }
  process.exit(errors.length > 0 ? 1 : 0);
}
