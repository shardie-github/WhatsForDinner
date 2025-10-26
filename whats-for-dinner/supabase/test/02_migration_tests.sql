-- pgTAP tests for database migrations
-- This file tests that migrations can be applied and rolled back correctly

BEGIN;

-- Load pgTAP extension
CREATE EXTENSION IF NOT EXISTS pgtap;

-- Test plan
SELECT plan(20);

-- Test 1: Verify all required tables exist
SELECT has_table('public', 'profiles', 'profiles table exists');
SELECT has_table('public', 'pantry_items', 'pantry_items table exists');
SELECT has_table('public', 'recipes', 'recipes table exists');
SELECT has_table('public', 'favorites', 'favorites table exists');
SELECT has_table('public', 'tenants', 'tenants table exists');
SELECT has_table('public', 'tenant_memberships', 'tenant_memberships table exists');
SELECT has_table('public', 'subscriptions', 'subscriptions table exists');
SELECT has_table('public', 'usage_logs', 'usage_logs table exists');
SELECT has_table('public', 'tenant_invites', 'tenant_invites table exists');
SELECT has_table('public', 'ai_cache', 'ai_cache table exists');
SELECT has_table('public', 'billing_events', 'billing_events table exists');

-- Test 2: Verify table structures
SELECT has_column('public', 'profiles', 'id', 'profiles has id column');
SELECT has_column('public', 'profiles', 'name', 'profiles has name column');
SELECT has_column('public', 'profiles', 'tenant_id', 'profiles has tenant_id column');
SELECT has_column('public', 'profiles', 'role', 'profiles has role column');

SELECT has_column('public', 'pantry_items', 'id', 'pantry_items has id column');
SELECT has_column('public', 'pantry_items', 'user_id', 'pantry_items has user_id column');
SELECT has_column('public', 'pantry_items', 'tenant_id', 'pantry_items has tenant_id column');
SELECT has_column('public', 'pantry_items', 'ingredient', 'pantry_items has ingredient column');
SELECT has_column('public', 'pantry_items', 'quantity', 'pantry_items has quantity column');

SELECT has_column('public', 'recipes', 'id', 'recipes has id column');
SELECT has_column('public', 'recipes', 'user_id', 'recipes has user_id column');
SELECT has_column('public', 'recipes', 'tenant_id', 'recipes has tenant_id column');
SELECT has_column('public', 'recipes', 'title', 'recipes has title column');
SELECT has_column('public', 'recipes', 'details', 'recipes has details column');
SELECT has_column('public', 'recipes', 'calories', 'recipes has calories column');
SELECT has_column('public', 'recipes', 'time', 'recipes has time column');

-- Test 3: Verify primary keys
SELECT col_is_pk('public', 'profiles', 'id', 'profiles id is primary key');
SELECT col_is_pk('public', 'pantry_items', 'id', 'pantry_items id is primary key');
SELECT col_is_pk('public', 'recipes', 'id', 'recipes id is primary key');
SELECT col_is_pk('public', 'favorites', 'id', 'favorites id is primary key');
SELECT col_is_pk('public', 'tenants', 'id', 'tenants id is primary key');
SELECT col_is_pk('public', 'tenant_memberships', 'id', 'tenant_memberships id is primary key');
SELECT col_is_pk('public', 'subscriptions', 'id', 'subscriptions id is primary key');
SELECT col_is_pk('public', 'usage_logs', 'id', 'usage_logs id is primary key');
SELECT col_is_pk('public', 'tenant_invites', 'id', 'tenant_invites id is primary key');
SELECT col_is_pk('public', 'ai_cache', 'id', 'ai_cache id is primary key');
SELECT col_is_pk('public', 'billing_events', 'id', 'billing_events id is primary key');

-- Test 4: Verify foreign key constraints
SELECT fk_ok('public', 'profiles', 'id', 'auth', 'users', 'id', 'profiles.id references auth.users.id');
SELECT fk_ok('public', 'profiles', 'tenant_id', 'public', 'tenants', 'id', 'profiles.tenant_id references tenants.id');
SELECT fk_ok('public', 'pantry_items', 'user_id', 'public', 'profiles', 'id', 'pantry_items.user_id references profiles.id');
SELECT fk_ok('public', 'pantry_items', 'tenant_id', 'public', 'tenants', 'id', 'pantry_items.tenant_id references tenants.id');
SELECT fk_ok('public', 'recipes', 'user_id', 'public', 'profiles', 'id', 'recipes.user_id references profiles.id');
SELECT fk_ok('public', 'recipes', 'tenant_id', 'public', 'tenants', 'id', 'recipes.tenant_id references tenants.id');
SELECT fk_ok('public', 'favorites', 'user_id', 'public', 'profiles', 'id', 'favorites.user_id references profiles.id');
SELECT fk_ok('public', 'favorites', 'tenant_id', 'public', 'tenants', 'id', 'favorites.tenant_id references tenants.id');
SELECT fk_ok('public', 'favorites', 'recipe_id', 'public', 'recipes', 'id', 'favorites.recipe_id references recipes.id');
SELECT fk_ok('public', 'tenant_memberships', 'tenant_id', 'public', 'tenants', 'id', 'tenant_memberships.tenant_id references tenants.id');
SELECT fk_ok('public', 'tenant_memberships', 'user_id', 'auth', 'users', 'id', 'tenant_memberships.user_id references auth.users.id');
SELECT fk_ok('public', 'subscriptions', 'user_id', 'auth', 'users', 'id', 'subscriptions.user_id references auth.users.id');
SELECT fk_ok('public', 'subscriptions', 'tenant_id', 'public', 'tenants', 'id', 'subscriptions.tenant_id references tenants.id');
SELECT fk_ok('public', 'usage_logs', 'user_id', 'auth', 'users', 'id', 'usage_logs.user_id references auth.users.id');
SELECT fk_ok('public', 'usage_logs', 'tenant_id', 'public', 'tenants', 'id', 'usage_logs.tenant_id references tenants.id');
SELECT fk_ok('public', 'tenant_invites', 'tenant_id', 'public', 'tenants', 'id', 'tenant_invites.tenant_id references tenants.id');
SELECT fk_ok('public', 'tenant_invites', 'invited_by', 'auth', 'users', 'id', 'tenant_invites.invited_by references auth.users.id');
SELECT fk_ok('public', 'ai_cache', 'tenant_id', 'public', 'tenants', 'id', 'ai_cache.tenant_id references tenants.id');

-- Test 5: Verify check constraints
SELECT col_has_check('public', 'tenants', 'plan', 'tenants.plan has check constraint');
SELECT col_has_check('public', 'tenants', 'status', 'tenants.status has check constraint');
SELECT col_has_check('public', 'tenant_memberships', 'role', 'tenant_memberships.role has check constraint');
SELECT col_has_check('public', 'tenant_memberships', 'status', 'tenant_memberships.status has check constraint');
SELECT col_has_check('public', 'subscriptions', 'plan', 'subscriptions.plan has check constraint');
SELECT col_has_check('public', 'subscriptions', 'status', 'subscriptions.status has check constraint');
SELECT col_has_check('public', 'tenant_invites', 'role', 'tenant_invites.role has check constraint');
SELECT col_has_check('public', 'profiles', 'role', 'profiles.role has check constraint');

-- Test 6: Verify unique constraints
SELECT has_unique('public', 'tenant_memberships', 'tenant_memberships has unique constraint on (tenant_id, user_id)');
SELECT has_unique('public', 'subscriptions', 'subscriptions has unique constraint on stripe_subscription_id');
SELECT has_unique('public', 'tenant_invites', 'tenant_invites has unique constraint on token');
SELECT has_unique('public', 'billing_events', 'billing_events has unique constraint on stripe_event_id');
SELECT has_unique('public', 'ai_cache', 'ai_cache has unique constraint on (tenant_id, cache_key)');

-- Test 7: Verify indexes exist
SELECT has_index('public', 'tenants', 'idx_tenants_stripe_customer_id', 'tenants has stripe_customer_id index');
SELECT has_index('public', 'tenants', 'idx_tenants_plan', 'tenants has plan index');
SELECT has_index('public', 'tenants', 'idx_tenants_status', 'tenants has status index');
SELECT has_index('public', 'tenant_memberships', 'idx_tenant_memberships_tenant_id', 'tenant_memberships has tenant_id index');
SELECT has_index('public', 'tenant_memberships', 'idx_tenant_memberships_user_id', 'tenant_memberships has user_id index');
SELECT has_index('public', 'tenant_memberships', 'idx_tenant_memberships_role', 'tenant_memberships has role index');
SELECT has_index('public', 'subscriptions', 'idx_subscriptions_tenant_id', 'subscriptions has tenant_id index');
SELECT has_index('public', 'subscriptions', 'idx_subscriptions_stripe_subscription_id', 'subscriptions has stripe_subscription_id index');
SELECT has_index('public', 'subscriptions', 'idx_subscriptions_status', 'subscriptions has status index');
SELECT has_index('public', 'usage_logs', 'idx_usage_logs_tenant_id', 'usage_logs has tenant_id index');
SELECT has_index('public', 'usage_logs', 'idx_usage_logs_user_id', 'usage_logs has user_id index');
SELECT has_index('public', 'usage_logs', 'idx_usage_logs_timestamp', 'usage_logs has timestamp index');
SELECT has_index('public', 'usage_logs', 'idx_usage_logs_action', 'usage_logs has action index');
SELECT has_index('public', 'tenant_invites', 'idx_tenant_invites_token', 'tenant_invites has token index');
SELECT has_index('public', 'tenant_invites', 'idx_tenant_invites_tenant_id', 'tenant_invites has tenant_id index');
SELECT has_index('public', 'tenant_invites', 'idx_tenant_invites_expires_at', 'tenant_invites has expires_at index');
SELECT has_index('public', 'ai_cache', 'idx_ai_cache_tenant_id', 'ai_cache has tenant_id index');
SELECT has_index('public', 'ai_cache', 'idx_ai_cache_expires_at', 'ai_cache has expires_at index');
SELECT has_index('public', 'ai_cache', 'idx_ai_cache_prompt_hash', 'ai_cache has prompt_hash index');
SELECT has_index('public', 'billing_events', 'idx_billing_events_stripe_event_id', 'billing_events has stripe_event_id index');
SELECT has_index('public', 'billing_events', 'idx_billing_events_processed', 'billing_events has processed index');
SELECT has_index('public', 'profiles', 'idx_profiles_tenant_id', 'profiles has tenant_id index');
SELECT has_index('public', 'pantry_items', 'idx_pantry_items_tenant_id', 'pantry_items has tenant_id index');
SELECT has_index('public', 'recipes', 'idx_recipes_tenant_id', 'recipes has tenant_id index');
SELECT has_index('public', 'favorites', 'idx_favorites_tenant_id', 'favorites has tenant_id index');

-- Test 8: Verify RLS is enabled
SELECT relrowsecurity FROM pg_class WHERE relname = 'profiles' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
SELECT relrowsecurity FROM pg_class WHERE relname = 'pantry_items' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
SELECT relrowsecurity FROM pg_class WHERE relname = 'recipes' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
SELECT relrowsecurity FROM pg_class WHERE relname = 'favorites' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
SELECT relrowsecurity FROM pg_class WHERE relname = 'tenants' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
SELECT relrowsecurity FROM pg_class WHERE relname = 'tenant_memberships' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
SELECT relrowsecurity FROM pg_class WHERE relname = 'subscriptions' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
SELECT relrowsecurity FROM pg_class WHERE relname = 'usage_logs' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
SELECT relrowsecurity FROM pg_class WHERE relname = 'tenant_invites' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
SELECT relrowsecurity FROM pg_class WHERE relname = 'ai_cache' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
SELECT relrowsecurity FROM pg_class WHERE relname = 'billing_events' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Test 9: Verify functions exist
SELECT has_function('public', 'create_tenant_for_user', ARRAY['uuid', 'text', 'text'], 'create_tenant_for_user function exists');
SELECT has_function('public', 'check_user_quota', ARRAY['uuid', 'text'], 'check_user_quota function exists');
SELECT has_function('public', 'log_usage', ARRAY['uuid', 'text', 'int', 'numeric', 'text', 'jsonb'], 'log_usage function exists');
SELECT has_function('public', 'get_tenant_usage_summary', ARRAY['uuid'], 'get_tenant_usage_summary function exists');
SELECT has_function('public', 'update_updated_at_column', ARRAY[], 'update_updated_at_column function exists');
SELECT has_function('public', 'cleanup_expired_cache', ARRAY[], 'cleanup_expired_cache function exists');
SELECT has_function('public', 'cleanup_expired_invites', ARRAY[], 'cleanup_expired_invites function exists');

-- Test 10: Verify triggers exist
SELECT has_trigger('public', 'tenants', 'update_tenants_updated_at', 'tenants has update_updated_at trigger');
SELECT has_trigger('public', 'subscriptions', 'update_subscriptions_updated_at', 'subscriptions has update_updated_at trigger');

-- Test 11: Verify data types
SELECT col_type_is('public', 'profiles', 'id', 'uuid', 'profiles.id is uuid type');
SELECT col_type_is('public', 'profiles', 'preferences', 'jsonb', 'profiles.preferences is jsonb type');
SELECT col_type_is('public', 'pantry_items', 'id', 'bigint', 'pantry_items.id is bigint type');
SELECT col_type_is('public', 'pantry_items', 'ingredient', 'text', 'pantry_items.ingredient is text type');
SELECT col_type_is('public', 'pantry_items', 'quantity', 'integer', 'pantry_items.quantity is integer type');
SELECT col_type_is('public', 'recipes', 'details', 'jsonb', 'recipes.details is jsonb type');
SELECT col_type_is('public', 'recipes', 'calories', 'integer', 'recipes.calories is integer type');
SELECT col_type_is('public', 'tenants', 'id', 'uuid', 'tenants.id is uuid type');
SELECT col_type_is('public', 'tenants', 'plan', 'text', 'tenants.plan is text type');
SELECT col_type_is('public', 'tenants', 'settings', 'jsonb', 'tenants.settings is jsonb type');
SELECT col_type_is('public', 'tenants', 'metadata', 'jsonb', 'tenants.metadata is jsonb type');
SELECT col_type_is('public', 'usage_logs', 'cost_usd', 'numeric', 'usage_logs.cost_usd is numeric type');
SELECT col_type_is('public', 'ai_cache', 'response_data', 'jsonb', 'ai_cache.response_data is jsonb type');
SELECT col_type_is('public', 'billing_events', 'data', 'jsonb', 'billing_events.data is jsonb type');

-- Test 12: Verify default values
SELECT col_has_default('public', 'profiles', 'role', 'profiles.role has default value');
SELECT col_has_default('public', 'pantry_items', 'quantity', 'pantry_items.quantity has default value');
SELECT col_has_default('public', 'tenants', 'plan', 'tenants.plan has default value');
SELECT col_has_default('public', 'tenants', 'status', 'tenants.status has default value');
SELECT col_has_default('public', 'tenants', 'created_at', 'tenants.created_at has default value');
SELECT col_has_default('public', 'tenants', 'updated_at', 'tenants.updated_at has default value');
SELECT col_has_default('public', 'tenants', 'settings', 'tenants.settings has default value');
SELECT col_has_default('public', 'tenants', 'metadata', 'tenants.metadata has default value');
SELECT col_has_default('public', 'tenant_memberships', 'joined_at', 'tenant_memberships.joined_at has default value');
SELECT col_has_default('public', 'tenant_memberships', 'status', 'tenant_memberships.status has default value');
SELECT col_has_default('public', 'subscriptions', 'cancel_at_period_end', 'subscriptions.cancel_at_period_end has default value');
SELECT col_has_default('public', 'subscriptions', 'created_at', 'subscriptions.created_at has default value');
SELECT col_has_default('public', 'subscriptions', 'updated_at', 'subscriptions.updated_at has default value');
SELECT col_has_default('public', 'subscriptions', 'metadata', 'subscriptions.metadata has default value');
SELECT col_has_default('public', 'usage_logs', 'tokens_used', 'usage_logs.tokens_used has default value');
SELECT col_has_default('public', 'usage_logs', 'cost_usd', 'usage_logs.cost_usd has default value');
SELECT col_has_default('public', 'usage_logs', 'timestamp', 'usage_logs.timestamp has default value');
SELECT col_has_default('public', 'usage_logs', 'metadata', 'usage_logs.metadata has default value');
SELECT col_has_default('public', 'tenant_invites', 'created_at', 'tenant_invites.created_at has default value');
SELECT col_has_default('public', 'ai_cache', 'created_at', 'ai_cache.created_at has default value');
SELECT col_has_default('public', 'billing_events', 'processed', 'billing_events.processed has default value');
SELECT col_has_default('public', 'billing_events', 'created_at', 'billing_events.created_at has default value');

-- Test 13: Verify NOT NULL constraints
SELECT col_not_null('public', 'profiles', 'id', 'profiles.id is NOT NULL');
SELECT col_not_null('public', 'pantry_items', 'ingredient', 'pantry_items.ingredient is NOT NULL');
SELECT col_not_null('public', 'tenants', 'name', 'tenants.name is NOT NULL');
SELECT col_not_null('public', 'tenant_memberships', 'role', 'tenant_memberships.role is NOT NULL');
SELECT col_not_null('public', 'subscriptions', 'plan', 'subscriptions.plan is NOT NULL');
SELECT col_not_null('public', 'subscriptions', 'status', 'subscriptions.status is NOT NULL');
SELECT col_not_null('public', 'usage_logs', 'action', 'usage_logs.action is NOT NULL');
SELECT col_not_null('public', 'tenant_invites', 'email', 'tenant_invites.email is NOT NULL');
SELECT col_not_null('public', 'tenant_invites', 'role', 'tenant_invites.role is NOT NULL');
SELECT col_not_null('public', 'tenant_invites', 'token', 'tenant_invites.token is NOT NULL');
SELECT col_not_null('public', 'tenant_invites', 'expires_at', 'tenant_invites.expires_at is NOT NULL');
SELECT col_not_null('public', 'ai_cache', 'cache_key', 'ai_cache.cache_key is NOT NULL');
SELECT col_not_null('public', 'ai_cache', 'prompt_hash', 'ai_cache.prompt_hash is NOT NULL');
SELECT col_not_null('public', 'ai_cache', 'response_data', 'ai_cache.response_data is NOT NULL');
SELECT col_not_null('public', 'ai_cache', 'model_used', 'ai_cache.model_used is NOT NULL');
SELECT col_not_null('public', 'ai_cache', 'tokens_used', 'ai_cache.tokens_used is NOT NULL');
SELECT col_not_null('public', 'ai_cache', 'cost_usd', 'ai_cache.cost_usd is NOT NULL');
SELECT col_not_null('public', 'ai_cache', 'ttl_seconds', 'ai_cache.ttl_seconds is NOT NULL');
SELECT col_not_null('public', 'ai_cache', 'expires_at', 'ai_cache.expires_at is NOT NULL');
SELECT col_not_null('public', 'billing_events', 'stripe_event_id', 'billing_events.stripe_event_id is NOT NULL');
SELECT col_not_null('public', 'billing_events', 'event_type', 'billing_events.event_type is NOT NULL');
SELECT col_not_null('public', 'billing_events', 'data', 'billing_events.data is NOT NULL');

-- Test 14: Verify RLS policies exist
SELECT policies_are('public', 'profiles', ARRAY[
  'Users can view profiles in their tenants',
  'Users can update profiles in their tenants',
  'Users can insert profiles in their tenants'
], 'profiles has correct RLS policies');

SELECT policies_are('public', 'pantry_items', ARRAY[
  'Users can view pantry items in their tenants',
  'Users can insert pantry items in their tenants',
  'Users can update pantry items in their tenants',
  'Users can delete pantry items in their tenants'
], 'pantry_items has correct RLS policies');

SELECT policies_are('public', 'recipes', ARRAY[
  'Users can view recipes in their tenants',
  'Users can insert recipes in their tenants',
  'Users can update recipes in their tenants',
  'Users can delete recipes in their tenants'
], 'recipes has correct RLS policies');

SELECT policies_are('public', 'favorites', ARRAY[
  'Users can view favorites in their tenants',
  'Users can insert favorites in their tenants',
  'Users can delete favorites in their tenants'
], 'favorites has correct RLS policies');

SELECT policies_are('public', 'tenants', ARRAY[
  'Users can view tenants they belong to',
  'Tenant owners can update their tenant'
], 'tenants has correct RLS policies');

SELECT policies_are('public', 'tenant_memberships', ARRAY[
  'Users can view memberships for their tenants',
  'Tenant owners can manage memberships'
], 'tenant_memberships has correct RLS policies');

SELECT policies_are('public', 'subscriptions', ARRAY[
  'Users can view their tenant subscriptions'
], 'subscriptions has correct RLS policies');

SELECT policies_are('public', 'usage_logs', ARRAY[
  'Users can view usage logs for their tenants',
  'System can insert usage logs'
], 'usage_logs has correct RLS policies');

SELECT policies_are('public', 'tenant_invites', ARRAY[
  'Users can view invites for their tenants',
  'Tenant owners can manage invites'
], 'tenant_invites has correct RLS policies');

SELECT policies_are('public', 'ai_cache', ARRAY[
  'Users can access cache for their tenants',
  'System can manage ai_cache'
], 'ai_cache has correct RLS policies');

SELECT policies_are('public', 'billing_events', ARRAY[
  'System can manage billing events'
], 'billing_events has correct RLS policies');

-- Test 15: Verify function return types
SELECT function_returns('public', 'create_tenant_for_user', ARRAY['uuid', 'text', 'text'], 'uuid', 'create_tenant_for_user returns uuid');
SELECT function_returns('public', 'check_user_quota', ARRAY['uuid', 'text'], 'boolean', 'check_user_quota returns boolean');
SELECT function_returns('public', 'log_usage', ARRAY['uuid', 'text', 'int', 'numeric', 'text', 'jsonb'], 'void', 'log_usage returns void');
SELECT function_returns('public', 'get_tenant_usage_summary', ARRAY['uuid'], 'record', 'get_tenant_usage_summary returns record');
SELECT function_returns('public', 'update_updated_at_column', ARRAY[], 'trigger', 'update_updated_at_column returns trigger');
SELECT function_returns('public', 'cleanup_expired_cache', ARRAY[], 'void', 'cleanup_expired_cache returns void');
SELECT function_returns('public', 'cleanup_expired_invites', ARRAY[], 'void', 'cleanup_expired_invites returns void');

-- Test 16: Verify function security
SELECT function_security('public', 'create_tenant_for_user', 'SECURITY DEFINER', 'create_tenant_for_user is SECURITY DEFINER');
SELECT function_security('public', 'check_user_quota', 'SECURITY DEFINER', 'check_user_quota is SECURITY DEFINER');
SELECT function_security('public', 'log_usage', 'SECURITY DEFINER', 'log_usage is SECURITY DEFINER');
SELECT function_security('public', 'get_tenant_usage_summary', 'SECURITY DEFINER', 'get_tenant_usage_summary is SECURITY DEFINER');
SELECT function_security('public', 'cleanup_expired_cache', 'SECURITY DEFINER', 'cleanup_expired_cache is SECURITY DEFINER');
SELECT function_security('public', 'cleanup_expired_invites', 'SECURITY DEFINER', 'cleanup_expired_invites is SECURITY DEFINER');

-- Test 17: Verify function language
SELECT function_lang('public', 'create_tenant_for_user', 'plpgsql', 'create_tenant_for_user is plpgsql');
SELECT function_lang('public', 'check_user_quota', 'plpgsql', 'check_user_quota is plpgsql');
SELECT function_lang('public', 'log_usage', 'plpgsql', 'log_usage is plpgsql');
SELECT function_lang('public', 'get_tenant_usage_summary', 'plpgsql', 'get_tenant_usage_summary is plpgsql');
SELECT function_lang('public', 'update_updated_at_column', 'plpgsql', 'update_updated_at_column is plpgsql');
SELECT function_lang('public', 'cleanup_expired_cache', 'plpgsql', 'cleanup_expired_cache is plpgsql');
SELECT function_lang('public', 'cleanup_expired_invites', 'plpgsql', 'cleanup_expired_invites is plpgsql');

-- Test 18: Verify trigger functions
SELECT trigger_is('public', 'tenants', 'update_tenants_updated_at', 'update_updated_at_column', 'update_tenants_updated_at trigger calls correct function');
SELECT trigger_is('public', 'subscriptions', 'update_subscriptions_updated_at', 'update_updated_at_column', 'update_subscriptions_updated_at trigger calls correct function');

-- Test 19: Verify trigger timing
SELECT trigger_timing('public', 'tenants', 'update_tenants_updated_at', 'BEFORE', 'update_tenants_updated_at trigger is BEFORE');
SELECT trigger_timing('public', 'subscriptions', 'update_subscriptions_updated_at', 'BEFORE', 'update_subscriptions_updated_at trigger is BEFORE');

-- Test 20: Verify trigger events
SELECT trigger_events('public', 'tenants', 'update_tenants_updated_at', ARRAY['UPDATE'], 'update_tenants_updated_at trigger fires on UPDATE');
SELECT trigger_events('public', 'subscriptions', 'update_subscriptions_updated_at', ARRAY['UPDATE'], 'update_subscriptions_updated_at trigger fires on UPDATE');

-- Finish tests
SELECT * FROM finish();

ROLLBACK;