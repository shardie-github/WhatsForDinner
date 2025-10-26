-- pgTAP tests for Row Level Security (RLS) policies
-- This file tests that RLS policies work correctly for multi-tenant isolation

BEGIN;

-- Load pgTAP extension
CREATE EXTENSION IF NOT EXISTS pgtap;

-- Test plan
SELECT plan(50);

-- Test data setup
-- Create test users
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'user1@test.com', 'password', now(), now(), now()),
  ('22222222-2222-2222-2222-222222222222', 'user2@test.com', 'password', now(), now(), now()),
  ('33333333-3333-3333-3333-333333333333', 'user3@test.com', 'password', now(), now(), now());

-- Create test tenants
INSERT INTO tenants (id, name, plan, status)
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Tenant A', 'free', 'active'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Tenant B', 'pro', 'active');

-- Create tenant memberships
INSERT INTO tenant_memberships (tenant_id, user_id, role, status)
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'owner', 'active'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'editor', 'active'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 'owner', 'active');

-- Create test profiles
INSERT INTO profiles (id, name, tenant_id, role)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'User 1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'owner'),
  ('22222222-2222-2222-2222-222222222222', 'User 2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'editor'),
  ('33333333-3333-3333-3333-333333333333', 'User 3', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'owner');

-- Create test pantry items
INSERT INTO pantry_items (user_id, tenant_id, ingredient, quantity)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'chicken', 2),
  ('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'rice', 1),
  ('33333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'beef', 3);

-- Create test recipes
INSERT INTO recipes (user_id, tenant_id, title, details, calories, time)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Chicken Rice', '{"ingredients": ["chicken", "rice"]}', 500, '30 min'),
  ('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Fried Rice', '{"ingredients": ["rice", "eggs"]}', 400, '20 min'),
  ('33333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Beef Stew', '{"ingredients": ["beef", "vegetables"]}', 600, '60 min');

-- Create test favorites
INSERT INTO favorites (user_id, tenant_id, recipe_id)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1),
  ('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 2);

-- Test 1: User 1 can view their own tenant's data
SET LOCAL role authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "11111111-1111-1111-1111-111111111111"}';

SELECT results_eq(
  'SELECT COUNT(*) FROM pantry_items WHERE user_id = ''11111111-1111-1111-1111-111111111111''',
  'SELECT 1',
  'User 1 can view their own pantry items'
);

SELECT results_eq(
  'SELECT COUNT(*) FROM recipes WHERE user_id = ''11111111-1111-1111-1111-111111111111''',
  'SELECT 1',
  'User 1 can view their own recipes'
);

SELECT results_eq(
  'SELECT COUNT(*) FROM favorites WHERE user_id = ''11111111-1111-1111-1111-111111111111''',
  'SELECT 1',
  'User 1 can view their own favorites'
);

-- Test 2: User 1 can view other users' data in same tenant
SELECT results_eq(
  'SELECT COUNT(*) FROM pantry_items WHERE tenant_id = ''aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa''',
  'SELECT 2',
  'User 1 can view all pantry items in their tenant'
);

SELECT results_eq(
  'SELECT COUNT(*) FROM recipes WHERE tenant_id = ''aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa''',
  'SELECT 2',
  'User 1 can view all recipes in their tenant'
);

-- Test 3: User 1 cannot view other tenant's data
SELECT results_eq(
  'SELECT COUNT(*) FROM pantry_items WHERE tenant_id = ''bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb''',
  'SELECT 0',
  'User 1 cannot view other tenant''s pantry items'
);

SELECT results_eq(
  'SELECT COUNT(*) FROM recipes WHERE tenant_id = ''bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb''',
  'SELECT 0',
  'User 1 cannot view other tenant''s recipes'
);

-- Test 4: User 1 can insert data in their tenant
INSERT INTO pantry_items (user_id, tenant_id, ingredient, quantity)
VALUES ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'onions', 5);

SELECT results_eq(
  'SELECT COUNT(*) FROM pantry_items WHERE ingredient = ''onions''',
  'SELECT 1',
  'User 1 can insert pantry items in their tenant'
);

-- Test 5: User 1 cannot insert data in other tenant
SELECT throws_ok(
  'INSERT INTO pantry_items (user_id, tenant_id, ingredient, quantity) VALUES (''11111111-1111-1111-1111-111111111111'', ''bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'', ''forbidden'', 1)',
  'User 1 cannot insert pantry items in other tenant'
);

-- Test 6: User 1 can update their own data
UPDATE pantry_items SET quantity = 10 WHERE ingredient = 'chicken' AND user_id = '11111111-1111-1111-1111-111111111111';

SELECT results_eq(
  'SELECT quantity FROM pantry_items WHERE ingredient = ''chicken''',
  'SELECT 10',
  'User 1 can update their own pantry items'
);

-- Test 7: User 1 can delete their own data
DELETE FROM pantry_items WHERE ingredient = 'onions' AND user_id = '11111111-1111-1111-1111-111111111111';

SELECT results_eq(
  'SELECT COUNT(*) FROM pantry_items WHERE ingredient = ''onions''',
  'SELECT 0',
  'User 1 can delete their own pantry items'
);

-- Test 8: Test tenant isolation for User 3 (different tenant)
SET LOCAL "request.jwt.claims" TO '{"sub": "33333333-3333-3333-3333-333333333333"}';

SELECT results_eq(
  'SELECT COUNT(*) FROM pantry_items WHERE tenant_id = ''bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb''',
  'SELECT 1',
  'User 3 can view their tenant''s pantry items'
);

SELECT results_eq(
  'SELECT COUNT(*) FROM pantry_items WHERE tenant_id = ''aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa''',
  'SELECT 0',
  'User 3 cannot view other tenant''s pantry items'
);

-- Test 9: Test tenant membership policies
SELECT results_eq(
  'SELECT COUNT(*) FROM tenant_memberships WHERE tenant_id = ''bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb''',
  'SELECT 1',
  'User 3 can view their tenant memberships'
);

SELECT results_eq(
  'SELECT COUNT(*) FROM tenant_memberships WHERE tenant_id = ''aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa''',
  'SELECT 0',
  'User 3 cannot view other tenant memberships'
);

-- Test 10: Test subscription policies
INSERT INTO subscriptions (user_id, tenant_id, plan, status)
VALUES ('33333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'pro', 'active');

SELECT results_eq(
  'SELECT COUNT(*) FROM subscriptions WHERE tenant_id = ''bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb''',
  'SELECT 1',
  'User 3 can view their tenant subscriptions'
);

-- Test 11: Test usage logs policies
INSERT INTO usage_logs (user_id, tenant_id, action, tokens_used, cost_usd)
VALUES ('33333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'meal_generation', 100, 0.01);

SELECT results_eq(
  'SELECT COUNT(*) FROM usage_logs WHERE tenant_id = ''bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb''',
  'SELECT 1',
  'User 3 can view their tenant usage logs'
);

-- Test 12: Test AI cache policies
INSERT INTO ai_cache (tenant_id, cache_key, prompt_hash, response_data, model_used, tokens_used, cost_usd, ttl_seconds, expires_at)
VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'test-key', 'hash123', '{"result": "test"}', 'gpt-4', 50, 0.005, 3600, now() + interval '1 hour');

SELECT results_eq(
  'SELECT COUNT(*) FROM ai_cache WHERE tenant_id = ''bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb''',
  'SELECT 1',
  'User 3 can view their tenant AI cache'
);

-- Test 13: Test tenant invite policies
INSERT INTO tenant_invites (tenant_id, email, role, invited_by, token, expires_at)
VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'invite@test.com', 'editor', '33333333-3333-3333-3333-333333333333', 'token123', now() + interval '7 days');

SELECT results_eq(
  'SELECT COUNT(*) FROM tenant_invites WHERE tenant_id = ''bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb''',
  'SELECT 1',
  'User 3 can view their tenant invites'
);

-- Test 14: Test billing events policies (system only)
SET LOCAL role service_role;

INSERT INTO billing_events (stripe_event_id, event_type, data)
VALUES ('evt_test123', 'customer.subscription.created', '{"id": "sub_test123"}');

SELECT results_eq(
  'SELECT COUNT(*) FROM billing_events',
  'SELECT 1',
  'System can manage billing events'
);

-- Test 15: Test quota checking function
SET LOCAL role authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "33333333-3333-3333-3333-333333333333"}';

SELECT ok(
  check_user_quota('33333333-3333-3333-3333-333333333333', 'meal_generation'),
  'User 3 has quota for meal generation'
);

-- Test 16: Test usage logging function
SELECT lives_ok(
  'SELECT log_usage(''33333333-3333-3333-3333-333333333333'', ''meal_generation'', 50, 0.005, ''gpt-4'', ''{}'')',
  'Usage logging function works'
);

-- Test 17: Test tenant usage summary function
SELECT results_eq(
  'SELECT total_meals_today FROM get_tenant_usage_summary(''bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'')',
  'SELECT 2::bigint',
  'Tenant usage summary shows correct meal count'
);

-- Test 18: Test tenant creation function
SELECT lives_ok(
  'SELECT create_tenant_for_user(''11111111-1111-1111-1111-111111111111'', ''New Tenant'', ''New User'')',
  'Tenant creation function works'
);

-- Test 19: Test cleanup functions
SELECT lives_ok(
  'SELECT cleanup_expired_cache()',
  'Cache cleanup function works'
);

SELECT lives_ok(
  'SELECT cleanup_expired_invites()',
  'Invite cleanup function works'
);

-- Test 20: Test constraint validations
SELECT throws_ok(
  'INSERT INTO tenants (plan) VALUES (''invalid_plan'')',
  'Tenant plan constraint works'
);

SELECT throws_ok(
  'INSERT INTO tenant_memberships (role) VALUES (''invalid_role'')',
  'Tenant membership role constraint works'
);

SELECT throws_ok(
  'INSERT INTO subscriptions (plan) VALUES (''invalid_plan'')',
  'Subscription plan constraint works'
);

-- Test 21: Test unique constraints
INSERT INTO tenant_memberships (tenant_id, user_id, role)
VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'viewer');

SELECT throws_ok(
  'INSERT INTO tenant_memberships (tenant_id, user_id, role) VALUES (''aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'', ''11111111-1111-1111-1111-111111111111'', ''viewer'')',
  'Unique constraint on tenant_memberships works'
);

-- Test 22: Test foreign key constraints
SELECT throws_ok(
  'INSERT INTO pantry_items (user_id, tenant_id, ingredient) VALUES (''99999999-9999-9999-9999-999999999999'', ''aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'', ''test'')',
  'Foreign key constraint on pantry_items works'
);

-- Test 23: Test check constraints on quantities
SELECT throws_ok(
  'INSERT INTO pantry_items (user_id, tenant_id, ingredient, quantity) VALUES (''11111111-1111-1111-1111-111111111111'', ''aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'', ''test'', -1)',
  'Quantity check constraint works'
);

-- Test 24: Test timestamp triggers
INSERT INTO tenants (name, plan) VALUES ('Test Tenant', 'free');
SELECT ok(
  created_at IS NOT NULL AND updated_at IS NOT NULL,
  'Timestamp triggers work on tenants'
) FROM tenants WHERE name = 'Test Tenant';

-- Test 25: Test JSONB constraints
SELECT lives_ok(
  'INSERT INTO profiles (id, name, tenant_id, preferences) VALUES (''44444444-4444-4444-4444-444444444444'', ''Test User'', ''aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'', ''{"theme": "dark"}'')',
  'JSONB preferences work'
);

-- Clean up test data
DELETE FROM billing_events;
DELETE FROM tenant_invites;
DELETE FROM ai_cache;
DELETE FROM usage_logs;
DELETE FROM subscriptions;
DELETE FROM tenant_memberships;
DELETE FROM favorites;
DELETE FROM recipes;
DELETE FROM pantry_items;
DELETE FROM profiles;
DELETE FROM tenants;
DELETE FROM auth.users WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444');

-- Finish tests
SELECT * FROM finish();

ROLLBACK;