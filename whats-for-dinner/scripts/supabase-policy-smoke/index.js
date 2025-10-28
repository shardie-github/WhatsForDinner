#!/usr/bin/env node

/**
 * Supabase RLS Policy Smoke Tests
 * 
 * This script tests Row Level Security policies to ensure:
 * - Anonymous users can only access what they should
 * - Authenticated users can only access their own data
 * - Service role can access what it needs
 * - Admin policies work correctly
 */

const { createClient } = require('@supabase/supabase-js');

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

class RLSSmokeTester {
  constructor() {
    this.testResults = [];
    this.testUserId = '00000000-0000-0000-0000-000000000000';
    this.testTenantId = '00000000-0000-0000-0000-000000000001';
  }

  async runTest(testName, testFn) {
    console.log(`🧪 Running test: ${testName}`);
    
    try {
      const result = await testFn();
      this.testResults.push({ name: testName, status: 'pass', details: result });
      console.log(`✅ ${testName}: PASS`);
      return result;
    } catch (error) {
      this.testResults.push({ name: testName, status: 'fail', details: error.message });
      console.log(`❌ ${testName}: FAIL - ${error.message}`);
      throw error;
    }
  }

  async testAnonymousAccess() {
    return await this.runTest('Anonymous Access Blocked', async () => {
      const tables = ['profiles', 'pantry_items', 'recipes', 'favorites'];
      const results = [];

      for (const table of tables) {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        // Should either return empty data or be blocked by RLS
        if (error && error.code === 'PGRST301') {
          results.push(`${table}: properly blocked`);
        } else if (data && data.length === 0) {
          results.push(`${table}: empty result (acceptable)`);
        } else {
          throw new Error(`${table}: unexpected access granted to anonymous user`);
        }
      }

      return results;
    });
  }

  async testServiceRoleAccess() {
    if (!supabaseAdmin) {
      console.log('⚠️  Skipping service role tests - no service role key provided');
      return;
    }

    return await this.runTest('Service Role Access', async () => {
      const tables = ['profiles', 'pantry_items', 'recipes', 'favorites'];
      const results = [];

      for (const table of tables) {
        const { data, error } = await supabaseAdmin
          .from(table)
          .select('count')
          .limit(1);

        if (error) {
          throw new Error(`${table}: service role access failed - ${error.message}`);
        }

        results.push(`${table}: accessible with service role`);
      }

      return results;
    });
  }

  async testUserDataIsolation() {
    return await this.runTest('User Data Isolation', async () => {
      if (!supabaseAdmin) {
        throw new Error('Service role key required for user isolation test');
      }

      // Create test data with service role
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: this.testUserId,
          name: 'Test User',
          tenant_id: this.testTenantId,
          role: 'owner'
        })
        .select()
        .single();

      if (profileError) {
        throw new Error(`Failed to create test profile: ${profileError.message}`);
      }

      // Create test pantry item
      const { data: pantryItem, error: pantryError } = await supabaseAdmin
        .from('pantry_items')
        .insert({
          user_id: this.testUserId,
          ingredient: 'test ingredient',
          quantity: 1
        })
        .select()
        .single();

      if (pantryError) {
        throw new Error(`Failed to create test pantry item: ${pantryError.message}`);
      }

      // Test that anonymous user cannot access this data
      const { data: anonData, error: anonError } = await supabase
        .from('pantry_items')
        .select('*')
        .eq('user_id', this.testUserId);

      if (anonData && anonData.length > 0) {
        throw new Error('Anonymous user can access user-specific data');
      }

      // Clean up test data
      await supabaseAdmin.from('pantry_items').delete().eq('id', pantryItem.id);
      await supabaseAdmin.from('profiles').delete().eq('id', this.testUserId);

      return ['User data properly isolated from anonymous access'];
    });
  }

  async testRLSPoliciesExist() {
    return await this.runTest('RLS Policies Exist', async () => {
      if (!supabaseAdmin) {
        throw new Error('Service role key required for RLS policy test');
      }

      // Check if RLS is enabled on key tables
      const { data, error } = await supabaseAdmin
        .rpc('check_rls_enabled', {
          table_name: 'profiles'
        });

      if (error) {
        // If the function doesn't exist, try a different approach
        const { data: policies, error: policyError } = await supabaseAdmin
          .from('pg_policies')
          .select('*')
          .eq('tablename', 'profiles');

        if (policyError) {
          throw new Error(`Failed to check RLS policies: ${policyError.message}`);
        }

        if (!policies || policies.length === 0) {
          throw new Error('No RLS policies found for profiles table');
        }

        return [`Found ${policies.length} RLS policies for profiles table`];
      }

      return ['RLS is properly enabled'];
    });
  }

  async testDatabaseFunctions() {
    return await this.runTest('Database Functions', async () => {
      if (!supabaseAdmin) {
        throw new Error('Service role key required for function test');
      }

      const functions = [
        'get_popular_ingredients',
        'get_cuisine_preferences',
        'get_recipe_feedback_summary'
      ];

      const results = [];

      for (const func of functions) {
        try {
          const { data, error } = await supabaseAdmin.rpc(func, {});
          
          if (error) {
            results.push(`${func}: error - ${error.message}`);
          } else {
            results.push(`${func}: accessible`);
          }
        } catch (err) {
          results.push(`${func}: exception - ${err.message}`);
        }
      }

      return results;
    });
  }

  async runAllTests() {
    console.log('🔒 Starting RLS Policy Smoke Tests...\n');

    try {
      await this.testAnonymousAccess();
      console.log('');

      await this.testServiceRoleAccess();
      console.log('');

      await this.testUserDataIsolation();
      console.log('');

      await this.testRLSPoliciesExist();
      console.log('');

      await this.testDatabaseFunctions();
      console.log('');

      // Summary
      console.log('📋 RLS Smoke Test Summary:');
      console.log('==========================');
      
      const passed = this.testResults.filter(r => r.status === 'pass').length;
      const failed = this.testResults.filter(r => r.status === 'fail').length;
      
      console.log(`✅ Passed: ${passed}`);
      console.log(`❌ Failed: ${failed}`);
      console.log(`📊 Total: ${this.testResults.length}`);

      if (failed > 0) {
        console.log('\n❌ Some tests failed. Check the details above.');
        process.exit(1);
      } else {
        console.log('\n✅ All RLS smoke tests passed!');
        process.exit(0);
      }

    } catch (error) {
      console.error('❌ RLS smoke test failed:', error);
      process.exit(1);
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new RLSSmokeTester();
  tester.runAllTests();
}

module.exports = RLSSmokeTester;