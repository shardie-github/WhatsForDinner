#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface TestResult {
  test: string;
  passed: boolean;
  error?: string;
  details?: string;
}

interface RLSResults {
  passed: number;
  failed: number;
  results: TestResult[];
}

async function testRLS(): Promise<RLSResults> {
  const results: TestResult[] = [];
  
  // Test 1: Anonymous user cannot access protected data
  try {
    const { data, error } = await anonClient
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      results.push({
        test: 'Anonymous access to profiles (should fail)',
        passed: true,
        details: 'Correctly blocked anonymous access'
      });
    } else if (data && data.length === 0) {
      results.push({
        test: 'Anonymous access to profiles (should fail)',
        passed: true,
        details: 'No data returned (RLS working)'
      });
    } else {
      results.push({
        test: 'Anonymous access to profiles (should fail)',
        passed: false,
        error: 'Anonymous user was able to access profiles data',
        details: `Returned ${data?.length} rows`
      });
    }
  } catch (err) {
    results.push({
      test: 'Anonymous access to profiles (should fail)',
      passed: true,
      details: 'Exception thrown (RLS working)'
    });
  }

  // Test 2: Anonymous user cannot access tenant data
  try {
    const { data, error } = await anonClient
      .from('tenants')
      .select('*')
      .limit(1);
    
    if (error) {
      results.push({
        test: 'Anonymous access to tenants (should fail)',
        passed: true,
        details: 'Correctly blocked anonymous access'
      });
    } else if (data && data.length === 0) {
      results.push({
        test: 'Anonymous access to tenants (should fail)',
        passed: true,
        details: 'No data returned (RLS working)'
      });
    } else {
      results.push({
        test: 'Anonymous access to tenants (should fail)',
        passed: false,
        error: 'Anonymous user was able to access tenant data',
        details: `Returned ${data?.length} rows`
      });
    }
  } catch (err) {
    results.push({
      test: 'Anonymous access to tenants (should fail)',
      passed: true,
      details: 'Exception thrown (RLS working)'
    });
  }

  // Test 3: Anonymous user cannot access usage logs
  try {
    const { data, error } = await anonClient
      .from('usage_logs')
      .select('*')
      .limit(1);
    
    if (error) {
      results.push({
        test: 'Anonymous access to usage_logs (should fail)',
        passed: true,
        details: 'Correctly blocked anonymous access'
      });
    } else if (data && data.length === 0) {
      results.push({
        test: 'Anonymous access to usage_logs (should fail)',
        passed: true,
        details: 'No data returned (RLS working)'
      });
    } else {
      results.push({
        test: 'Anonymous access to usage_logs (should fail)',
        passed: false,
        error: 'Anonymous user was able to access usage logs',
        details: `Returned ${data?.length} rows`
      });
    }
  } catch (err) {
    results.push({
      test: 'Anonymous access to usage_logs (should fail)',
      passed: true,
      details: 'Exception thrown (RLS working)'
    });
  }

  // Test 4: Service role can access data (should work)
  try {
    const { data, error } = await serviceClient
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      results.push({
        test: 'Service role access to profiles (should work)',
        passed: false,
        error: 'Service role was blocked from accessing profiles',
        details: error.message
      });
    } else {
      results.push({
        test: 'Service role access to profiles (should work)',
        passed: true,
        details: 'Service role can access data as expected'
      });
    }
  } catch (err) {
    results.push({
      test: 'Service role access to profiles (should work)',
      passed: false,
      error: 'Exception thrown for service role access',
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }

  // Test 5: Anonymous user cannot insert data
  try {
    const { data, error } = await anonClient
      .from('profiles')
      .insert({
        id: 'test-user-' + Date.now(),
        name: 'Test User',
        role: 'viewer'
      });
    
    if (error) {
      results.push({
        test: 'Anonymous insert to profiles (should fail)',
        passed: true,
        details: 'Correctly blocked anonymous insert'
      });
    } else {
      results.push({
        test: 'Anonymous insert to profiles (should fail)',
        passed: false,
        error: 'Anonymous user was able to insert data',
        details: 'RLS policy not properly configured for inserts'
      });
    }
  } catch (err) {
    results.push({
      test: 'Anonymous insert to profiles (should fail)',
      passed: true,
      details: 'Exception thrown (RLS working)'
    });
  }

  // Test 6: Anonymous user cannot update data
  try {
    const { data, error } = await anonClient
      .from('profiles')
      .update({ name: 'Hacked' })
      .eq('id', 'any-id');
    
    if (error) {
      results.push({
        test: 'Anonymous update to profiles (should fail)',
        passed: true,
        details: 'Correctly blocked anonymous update'
      });
    } else {
      results.push({
        test: 'Anonymous update to profiles (should fail)',
        passed: false,
        error: 'Anonymous user was able to update data',
        details: 'RLS policy not properly configured for updates'
      });
    }
  } catch (err) {
    results.push({
      test: 'Anonymous update to profiles (should fail)',
      passed: true,
      details: 'Exception thrown (RLS working)'
    });
  }

  // Test 7: Anonymous user cannot delete data
  try {
    const { data, error } = await anonClient
      .from('profiles')
      .delete()
      .eq('id', 'any-id');
    
    if (error) {
      results.push({
        test: 'Anonymous delete from profiles (should fail)',
        passed: true,
        details: 'Correctly blocked anonymous delete'
      });
    } else {
      results.push({
        test: 'Anonymous delete from profiles (should fail)',
        passed: false,
        error: 'Anonymous user was able to delete data',
        details: 'RLS policy not properly configured for deletes'
      });
    }
  } catch (err) {
    results.push({
      test: 'Anonymous delete from profiles (should fail)',
      passed: true,
      details: 'Exception thrown (RLS working)'
    });
  }

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  return { passed, failed, results };
}

function printReport(results: RLSResults) {
  console.log('\n🔒 RLS (Row Level Security) Smoke Test Report');
  console.log('==============================================\n');

  results.results.forEach((result, index) => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} Test ${index + 1}: ${result.test}`);
    
    if (result.details) {
      console.log(`   Details: ${result.details}`);
    }
    
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    console.log('');
  });

  console.log('📊 Summary:');
  console.log(`   ✅ Passed: ${results.passed}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log(`   📁 Total: ${results.results.length}`);

  if (results.failed > 0) {
    console.log('\n🚨 Security Warning: RLS policies may not be properly configured!');
    console.log('   Review the failed tests and ensure proper RLS policies are in place.');
  } else {
    console.log('\n✅ All RLS tests passed! Security policies are working correctly.');
  }
}

async function main() {
  const args = process.argv.slice(2);
  const checkOnly = args.includes('--check');
  
  console.log('🔍 Running RLS smoke tests...');
  
  try {
    const results = await testRLS();
    printReport(results);
    
    if (checkOnly) {
      if (results.failed > 0) {
        console.log('\n❌ RLS smoke test failed!');
        process.exit(1);
      } else {
        console.log('\n✅ RLS smoke test passed!');
      }
    }
  } catch (error) {
    console.error('❌ Error running RLS smoke test:', error);
    process.exit(1);
  }
}

main();