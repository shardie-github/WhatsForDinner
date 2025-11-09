#!/usr/bin/env node
/**
 * Performance Intelligence Layer: Setup Verification Script
 * Verifies that all components are properly configured
 */

import { createClient } from '@supabase/supabase-js';
import { existsSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const checks = {
  env: false,
  database: false,
  api: false,
  scripts: false,
  workflow: false,
};

console.log('🔍 Verifying Performance Intelligence Layer setup...\n');

// Check environment variables
console.log('1. Checking environment variables...');
if (supabaseUrl && supabaseServiceKey) {
  console.log('   ✅ Supabase credentials found');
  checks.env = true;
} else {
  console.log('   ❌ Missing Supabase credentials');
  console.log('      Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
}

// Check database table
if (checks.env) {
  console.log('\n2. Checking database table...');
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabase
      .from('metrics_log')
      .select('id')
      .limit(1);

    if (error && error.code === '42P01') {
      console.log('   ❌ metrics_log table does not exist');
      console.log('      Run: supabase migration up');
    } else if (error) {
      console.log(`   ⚠️  Database error: ${error.message}`);
    } else {
      console.log('   ✅ metrics_log table exists');
      checks.database = true;
    }
  } catch (error) {
    console.log(`   ❌ Database check failed: ${error.message}`);
  }
}

// Check API routes
console.log('\n3. Checking API routes...');
const apiRoutes = [
  'apps/web/src/app/api/metrics/dashboard/route.ts',
  'apps/web/src/app/api/telemetry/route.ts',
  'apps/web/src/app/api/metrics.json/route.ts',
];

let apiRoutesExist = true;
for (const route of apiRoutes) {
  if (existsSync(join(process.cwd(), route))) {
    console.log(`   ✅ ${route}`);
  } else {
    console.log(`   ❌ ${route} missing`);
    apiRoutesExist = false;
  }
}
checks.api = apiRoutesExist;

// Check scripts
console.log('\n4. Checking collection scripts...');
const scripts = [
  'infra/scripts/collect-metrics.mjs',
  'infra/scripts/analyze-metrics.mjs',
  'infra/scripts/generate-performance-report.mjs',
];

let scriptsExist = true;
for (const script of scripts) {
  if (existsSync(join(process.cwd(), script))) {
    console.log(`   ✅ ${script}`);
  } else {
    console.log(`   ❌ ${script} missing`);
    scriptsExist = false;
  }
}
checks.scripts = scriptsExist;

// Check GitHub workflow
console.log('\n5. Checking GitHub Actions workflow...');
if (existsSync(join(process.cwd(), '.github/workflows/telemetry.yml'))) {
  console.log('   ✅ .github/workflows/telemetry.yml exists');
  checks.workflow = true;
} else {
  console.log('   ❌ .github/workflows/telemetry.yml missing');
}

// Check admin dashboard
console.log('\n6. Checking admin dashboard...');
if (existsSync(join(process.cwd(), 'apps/web/src/app/admin/(console)/metrics/page.tsx'))) {
  console.log('   ✅ Admin dashboard exists');
} else {
  console.log('   ❌ Admin dashboard missing');
}

// Check telemetry beacon
console.log('\n7. Checking telemetry beacon...');
if (existsSync(join(process.cwd(), 'apps/web/src/lib/telemetry-beacon.ts'))) {
  console.log('   ✅ Telemetry beacon exists');
} else {
  console.log('   ❌ Telemetry beacon missing');
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 Verification Summary');
console.log('='.repeat(50));

const allChecks = Object.values(checks);
const passed = allChecks.filter(Boolean).length;
const total = allChecks.length;

console.log(`\n✅ Passed: ${passed}/${total}`);

if (passed === total) {
  console.log('\n🎉 Performance Intelligence Layer is fully configured!');
  process.exit(0);
} else {
  console.log('\n⚠️  Some checks failed. Please review the output above.');
  console.log('\n📚 See PERFORMANCE_INTELLIGENCE_README.md for setup instructions.');
  process.exit(1);
}
