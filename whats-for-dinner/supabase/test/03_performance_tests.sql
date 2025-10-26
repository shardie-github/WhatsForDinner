-- pgTAP tests for database performance and optimization
-- This file tests that indexes, constraints, and queries perform well

BEGIN;

-- Load pgTAP extension
CREATE EXTENSION IF NOT EXISTS pgtap;

-- Test plan
SELECT plan(30);

-- Test 1: Verify index usage for common queries
-- Test tenant-based queries
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT * FROM pantry_items WHERE tenant_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

SELECT ok(
  (SELECT jsonb_path_query_first(explain_result, '$.Execution.Plan.Plans[0].IndexName') IS NOT NULL),
  'pantry_items tenant_id query uses index'
) FROM (SELECT explain_result FROM (EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT * FROM pantry_items WHERE tenant_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa') AS explain_result) AS t;

-- Test 2: Verify index usage for user-based queries
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT * FROM pantry_items WHERE user_id = '11111111-1111-1111-1111-111111111111';

SELECT ok(
  (SELECT jsonb_path_query_first(explain_result, '$.Execution.Plan.Plans[0].IndexName') IS NOT NULL),
  'pantry_items user_id query uses index'
) FROM (SELECT explain_result FROM (EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT * FROM pantry_items WHERE user_id = '11111111-1111-1111-1111-111111111111') AS explain_result) AS t;

-- Test 3: Verify index usage for recipe queries
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT * FROM recipes WHERE tenant_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

SELECT ok(
  (SELECT jsonb_path_query_first(explain_result, '$.Execution.Plan.Plans[0].IndexName') IS NOT NULL),
  'recipes tenant_id query uses index'
) FROM (SELECT explain_result FROM (EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT * FROM recipes WHERE tenant_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa') AS explain_result) AS t;

-- Test 4: Verify index usage for usage logs queries
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT * FROM usage_logs WHERE tenant_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' AND timestamp >= current_date;

SELECT ok(
  (SELECT jsonb_path_query_first(explain_result, '$.Execution.Plan.Plans[0].IndexName') IS NOT NULL),
  'usage_logs tenant_id and timestamp query uses index'
) FROM (SELECT explain_result FROM (EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT * FROM usage_logs WHERE tenant_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' AND timestamp >= current_date) AS explain_result) AS t;

-- Test 5: Verify index usage for AI cache queries
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT * FROM ai_cache WHERE tenant_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' AND expires_at > now();

SELECT ok(
  (SELECT jsonb_path_query_first(explain_result, '$.Execution.Plan.Plans[0].IndexName') IS NOT NULL),
  'ai_cache tenant_id and expires_at query uses index'
) FROM (SELECT explain_result FROM (EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT * FROM ai_cache WHERE tenant_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' AND expires_at > now()) AS explain_result) AS t;

-- Test 6: Verify index usage for tenant membership queries
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT * FROM tenant_memberships WHERE user_id = '11111111-1111-1111-1111-111111111111';

SELECT ok(
  (SELECT jsonb_path_query_first(explain_result, '$.Execution.Plan.Plans[0].IndexName') IS NOT NULL),
  'tenant_memberships user_id query uses index'
) FROM (SELECT explain_result FROM (EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT * FROM tenant_memberships WHERE user_id = '11111111-1111-1111-1111-111111111111') AS explain_result) AS t;

-- Test 7: Verify index usage for subscription queries
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT * FROM subscriptions WHERE stripe_subscription_id = 'sub_test123';

SELECT ok(
  (SELECT jsonb_path_query_first(explain_result, '$.Execution.Plan.Plans[0].IndexName') IS NOT NULL),
  'subscriptions stripe_subscription_id query uses index'
) FROM (SELECT explain_result FROM (EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT * FROM subscriptions WHERE stripe_subscription_id = 'sub_test123') AS explain_result) AS t;

-- Test 8: Verify index usage for billing events queries
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT * FROM billing_events WHERE stripe_event_id = 'evt_test123';

SELECT ok(
  (SELECT jsonb_path_query_first(explain_result, '$.Execution.Plan.Plans[0].IndexName') IS NOT NULL),
  'billing_events stripe_event_id query uses index'
) FROM (SELECT explain_result FROM (EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT * FROM billing_events WHERE stripe_event_id = 'evt_test123') AS explain_result) AS t;

-- Test 9: Verify index usage for tenant invites queries
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT * FROM tenant_invites WHERE token = 'token123';

SELECT ok(
  (SELECT jsonb_path_query_first(explain_result, '$.Execution.Plan.Plans[0].IndexName') IS NOT NULL),
  'tenant_invites token query uses index'
) FROM (SELECT explain_result FROM (EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT * FROM tenant_invites WHERE token = 'token123') AS explain_result) AS t;

-- Test 10: Verify index usage for AI cache prompt hash queries
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT * FROM ai_cache WHERE prompt_hash = 'hash123';

SELECT ok(
  (SELECT jsonb_path_query_first(explain_result, '$.Execution.Plan.Plans[0].IndexName') IS NOT NULL),
  'ai_cache prompt_hash query uses index'
) FROM (SELECT explain_result FROM (EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT * FROM ai_cache WHERE prompt_hash = 'hash123') AS explain_result) AS t;

-- Test 11: Verify query performance for tenant usage summary
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT * FROM get_tenant_usage_summary('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

SELECT ok(
  (SELECT jsonb_path_query_first(explain_result, '$.Execution.Plan.Plans[0].IndexName') IS NOT NULL),
  'get_tenant_usage_summary function uses indexes'
) FROM (SELECT explain_result FROM (EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT * FROM get_tenant_usage_summary('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')) AS explain_result) AS t;

-- Test 12: Verify query performance for quota checking
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT check_user_quota('11111111-1111-1111-1111-111111111111', 'meal_generation');

SELECT ok(
  (SELECT jsonb_path_query_first(explain_result, '$.Execution.Plan.Plans[0].IndexName') IS NOT NULL),
  'check_user_quota function uses indexes'
) FROM (SELECT explain_result FROM (EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT check_user_quota('11111111-1111-1111-1111-111111111111', 'meal_generation')) AS explain_result) AS t;

-- Test 13: Verify query performance for tenant creation
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT create_tenant_for_user('11111111-1111-1111-1111-111111111111', 'Test Tenant', 'Test User');

SELECT ok(
  (SELECT jsonb_path_query_first(explain_result, '$.Execution.Plan.Plans[0].IndexName') IS NOT NULL),
  'create_tenant_for_user function uses indexes'
) FROM (SELECT explain_result FROM (EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT create_tenant_for_user('11111111-1111-1111-1111-111111111111', 'Test Tenant', 'Test User')) AS explain_result) AS t;

-- Test 14: Verify query performance for usage logging
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT log_usage('11111111-1111-1111-1111-111111111111', 'meal_generation', 50, 0.005, 'gpt-4', '{}');

SELECT ok(
  (SELECT jsonb_path_query_first(explain_result, '$.Execution.Plan.Plans[0].IndexName') IS NOT NULL),
  'log_usage function uses indexes'
) FROM (SELECT explain_result FROM (EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT log_usage('11111111-1111-1111-1111-111111111111', 'meal_generation', 50, 0.005, 'gpt-4', '{}')) AS explain_result) AS t;

-- Test 15: Verify query performance for cache cleanup
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT cleanup_expired_cache();

SELECT ok(
  (SELECT jsonb_path_query_first(explain_result, '$.Execution.Plan.Plans[0].IndexName') IS NOT NULL),
  'cleanup_expired_cache function uses indexes'
) FROM (SELECT explain_result FROM (EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT cleanup_expired_cache()) AS explain_result) AS t;

-- Test 16: Verify query performance for invite cleanup
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT cleanup_expired_invites();

SELECT ok(
  (SELECT jsonb_path_query_first(explain_result, '$.Execution.Plan.Plans[0].IndexName') IS NOT NULL),
  'cleanup_expired_invites function uses indexes'
) FROM (SELECT explain_result FROM (EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT cleanup_expired_invites()) AS explain_result) AS t;

-- Test 17: Verify query performance for complex tenant queries
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT t.name, COUNT(tm.user_id) as member_count, COUNT(s.id) as subscription_count
FROM tenants t
LEFT JOIN tenant_memberships tm ON t.id = tm.tenant_id
LEFT JOIN subscriptions s ON t.id = s.tenant_id
WHERE t.status = 'active'
GROUP BY t.id, t.name;

SELECT ok(
  (SELECT jsonb_path_query_first(explain_result, '$.Execution.Plan.Plans[0].IndexName') IS NOT NULL),
  'complex tenant query uses indexes'
) FROM (SELECT explain_result FROM (EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT t.name, COUNT(tm.user_id) as member_count, COUNT(s.id) as subscription_count
FROM tenants t
LEFT JOIN tenant_memberships tm ON t.id = tm.tenant_id
LEFT JOIN subscriptions s ON t.id = s.tenant_id
WHERE t.status = 'active'
GROUP BY t.id, t.name) AS explain_result) AS t;

-- Test 18: Verify query performance for usage analytics
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT action, COUNT(*) as count, SUM(tokens_used) as total_tokens, SUM(cost_usd) as total_cost
FROM usage_logs
WHERE tenant_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  AND timestamp >= current_date - interval '30 days'
GROUP BY action;

SELECT ok(
  (SELECT jsonb_path_query_first(explain_result, '$.Execution.Plan.Plans[0].IndexName') IS NOT NULL),
  'usage analytics query uses indexes'
) FROM (SELECT explain_result FROM (EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT action, COUNT(*) as count, SUM(tokens_used) as total_tokens, SUM(cost_usd) as total_cost
FROM usage_logs
WHERE tenant_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  AND timestamp >= current_date - interval '30 days'
GROUP BY action) AS explain_result) AS t;

-- Test 19: Verify query performance for recipe search
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT r.*, p.name as user_name
FROM recipes r
JOIN profiles p ON r.user_id = p.id
WHERE r.tenant_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  AND (r.title ILIKE '%chicken%' OR r.details->>'ingredients' ILIKE '%chicken%')
ORDER BY r.created_at DESC;

SELECT ok(
  (SELECT jsonb_path_query_first(explain_result, '$.Execution.Plan.Plans[0].IndexName') IS NOT NULL),
  'recipe search query uses indexes'
) FROM (SELECT explain_result FROM (EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT r.*, p.name as user_name
FROM recipes r
JOIN profiles p ON r.user_id = p.id
WHERE r.tenant_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  AND (r.title ILIKE '%chicken%' OR r.details->>'ingredients' ILIKE '%chicken%')
ORDER BY r.created_at DESC) AS explain_result) AS t;

-- Test 20: Verify query performance for pantry management
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT pi.*, p.name as user_name
FROM pantry_items pi
JOIN profiles p ON pi.user_id = p.id
WHERE pi.tenant_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  AND pi.quantity > 0
ORDER BY pi.ingredient;

SELECT ok(
  (SELECT jsonb_path_query_first(explain_result, '$.Execution.Plan.Plans[0].IndexName') IS NOT NULL),
  'pantry management query uses indexes'
) FROM (SELECT explain_result FROM (EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT pi.*, p.name as user_name
FROM pantry_items pi
JOIN profiles p ON pi.user_id = p.id
WHERE pi.tenant_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  AND pi.quantity > 0
ORDER BY pi.ingredient) AS explain_result) AS t;

-- Test 21: Verify query performance for favorite recipes
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT f.*, r.title, r.details, p.name as user_name
FROM favorites f
JOIN recipes r ON f.recipe_id = r.id
JOIN profiles p ON f.user_id = p.id
WHERE f.tenant_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
ORDER BY f.created_at DESC;

SELECT ok(
  (SELECT jsonb_path_query_first(explain_result, '$.Execution.Plan.Plans[0].IndexName') IS NOT NULL),
  'favorite recipes query uses indexes'
) FROM (SELECT explain_result FROM (EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT f.*, r.title, r.details, p.name as user_name
FROM favorites f
JOIN recipes r ON f.recipe_id = r.id
JOIN profiles p ON f.user_id = p.id
WHERE f.tenant_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
ORDER BY f.created_at DESC) AS explain_result) AS t;

-- Test 22: Verify query performance for tenant member management
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT tm.*, p.name as user_name, t.name as tenant_name
FROM tenant_memberships tm
JOIN profiles p ON tm.user_id = p.id
JOIN tenants t ON tm.tenant_id = t.id
WHERE tm.tenant_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
ORDER BY tm.joined_at DESC;

SELECT ok(
  (SELECT jsonb_path_query_first(explain_result, '$.Execution.Plan.Plans[0].IndexName') IS NOT NULL),
  'tenant member management query uses indexes'
) FROM (SELECT explain_result FROM (EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT tm.*, p.name as user_name, t.name as tenant_name
FROM tenant_memberships tm
JOIN profiles p ON tm.user_id = p.id
JOIN tenants t ON tm.tenant_id = t.id
WHERE tm.tenant_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
ORDER BY tm.joined_at DESC) AS explain_result) AS t;

-- Test 23: Verify query performance for subscription management
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT s.*, t.name as tenant_name, p.name as user_name
FROM subscriptions s
JOIN tenants t ON s.tenant_id = t.id
JOIN profiles p ON s.user_id = p.id
WHERE s.status = 'active'
ORDER BY s.created_at DESC;

SELECT ok(
  (SELECT jsonb_path_query_first(explain_result, '$.Execution.Plan.Plans[0].IndexName') IS NOT NULL),
  'subscription management query uses indexes'
) FROM (SELECT explain_result FROM (EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT s.*, t.name as tenant_name, p.name as user_name
FROM subscriptions s
JOIN tenants t ON s.tenant_id = t.id
JOIN profiles p ON s.user_id = p.id
WHERE s.status = 'active'
ORDER BY s.created_at DESC) AS explain_result) AS t;

-- Test 24: Verify query performance for billing events
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT * FROM billing_events
WHERE processed = false
ORDER BY created_at ASC;

SELECT ok(
  (SELECT jsonb_path_query_first(explain_result, '$.Execution.Plan.Plans[0].IndexName') IS NOT NULL),
  'billing events query uses indexes'
) FROM (SELECT explain_result FROM (EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT * FROM billing_events
WHERE processed = false
ORDER BY created_at ASC) AS explain_result) AS t;

-- Test 25: Verify query performance for AI cache management
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT * FROM ai_cache
WHERE tenant_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  AND expires_at > now()
ORDER BY created_at DESC;

SELECT ok(
  (SELECT jsonb_path_query_first(explain_result, '$.Execution.Plan.Plans[0].IndexName') IS NOT NULL),
  'AI cache management query uses indexes'
) FROM (SELECT explain_result FROM (EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT * FROM ai_cache
WHERE tenant_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  AND expires_at > now()
ORDER BY created_at DESC) AS explain_result) AS t;

-- Test 26: Verify query performance for tenant invites
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT ti.*, t.name as tenant_name, p.name as invited_by_name
FROM tenant_invites ti
JOIN tenants t ON ti.tenant_id = t.id
JOIN profiles p ON ti.invited_by = p.id
WHERE ti.tenant_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  AND ti.expires_at > now()
ORDER BY ti.created_at DESC;

SELECT ok(
  (SELECT jsonb_path_query_first(explain_result, '$.Execution.Plan.Plans[0].IndexName') IS NOT NULL),
  'tenant invites query uses indexes'
) FROM (SELECT explain_result FROM (EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT ti.*, t.name as tenant_name, p.name as invited_by_name
FROM tenant_invites ti
JOIN tenants t ON ti.tenant_id = t.id
JOIN profiles p ON ti.invited_by = p.id
WHERE ti.tenant_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  AND ti.expires_at > now()
ORDER BY ti.created_at DESC) AS explain_result) AS t;

-- Test 27: Verify query performance for tenant analytics
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT t.name, t.plan, t.status, COUNT(tm.user_id) as member_count, COUNT(s.id) as subscription_count
FROM tenants t
LEFT JOIN tenant_memberships tm ON t.id = tm.tenant_id AND tm.status = 'active'
LEFT JOIN subscriptions s ON t.id = s.tenant_id AND s.status = 'active'
GROUP BY t.id, t.name, t.plan, t.status
ORDER BY t.created_at DESC;

SELECT ok(
  (SELECT jsonb_path_query_first(explain_result, '$.Execution.Plan.Plans[0].IndexName') IS NOT NULL),
  'tenant analytics query uses indexes'
) FROM (SELECT explain_result FROM (EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT t.name, t.plan, t.status, COUNT(tm.user_id) as member_count, COUNT(s.id) as subscription_count
FROM tenants t
LEFT JOIN tenant_memberships tm ON t.id = tm.tenant_id AND tm.status = 'active'
LEFT JOIN subscriptions s ON t.id = s.tenant_id AND s.status = 'active'
GROUP BY t.id, t.name, t.plan, t.status
ORDER BY t.created_at DESC) AS explain_result) AS t;

-- Test 28: Verify query performance for user activity
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT p.name, COUNT(pi.id) as pantry_count, COUNT(r.id) as recipe_count, COUNT(f.id) as favorite_count
FROM profiles p
LEFT JOIN pantry_items pi ON p.id = pi.user_id
LEFT JOIN recipes r ON p.id = r.user_id
LEFT JOIN favorites f ON p.id = f.user_id
WHERE p.tenant_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
GROUP BY p.id, p.name
ORDER BY p.name;

SELECT ok(
  (SELECT jsonb_path_query_first(explain_result, '$.Execution.Plan.Plans[0].IndexName') IS NOT NULL),
  'user activity query uses indexes'
) FROM (SELECT explain_result FROM (EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT p.name, COUNT(pi.id) as pantry_count, COUNT(r.id) as recipe_count, COUNT(f.id) as favorite_count
FROM profiles p
LEFT JOIN pantry_items pi ON p.id = pi.user_id
LEFT JOIN recipes r ON p.id = r.user_id
LEFT JOIN favorites f ON p.id = f.user_id
WHERE p.tenant_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
GROUP BY p.id, p.name
ORDER BY p.name) AS explain_result) AS t;

-- Test 29: Verify query performance for cost analysis
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT 
  DATE(timestamp) as date,
  action,
  COUNT(*) as count,
  SUM(tokens_used) as total_tokens,
  SUM(cost_usd) as total_cost,
  AVG(cost_usd) as avg_cost
FROM usage_logs
WHERE tenant_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  AND timestamp >= current_date - interval '7 days'
GROUP BY DATE(timestamp), action
ORDER BY date DESC, action;

SELECT ok(
  (SELECT jsonb_path_query_first(explain_result, '$.Execution.Plan.Plans[0].IndexName') IS NOT NULL),
  'cost analysis query uses indexes'
) FROM (SELECT explain_result FROM (EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT 
  DATE(timestamp) as date,
  action,
  COUNT(*) as count,
  SUM(tokens_used) as total_tokens,
  SUM(cost_usd) as total_cost,
  AVG(cost_usd) as avg_cost
FROM usage_logs
WHERE tenant_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  AND timestamp >= current_date - interval '7 days'
GROUP BY DATE(timestamp), action
ORDER BY date DESC, action) AS explain_result) AS t;

-- Test 30: Verify query performance for system health
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT 
  'tenants' as table_name,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE status = 'active') as active_count,
  COUNT(*) FILTER (WHERE status = 'inactive') as inactive_count
FROM tenants
UNION ALL
SELECT 
  'tenant_memberships' as table_name,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE status = 'active') as active_count,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_count
FROM tenant_memberships
UNION ALL
SELECT 
  'subscriptions' as table_name,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE status = 'active') as active_count,
  COUNT(*) FILTER (WHERE status = 'canceled') as canceled_count
FROM subscriptions;

SELECT ok(
  (SELECT jsonb_path_query_first(explain_result, '$.Execution.Plan.Plans[0].IndexName') IS NOT NULL),
  'system health query uses indexes'
) FROM (SELECT explain_result FROM (EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT 
  'tenants' as table_name,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE status = 'active') as active_count,
  COUNT(*) FILTER (WHERE status = 'inactive') as inactive_count
FROM tenants
UNION ALL
SELECT 
  'tenant_memberships' as table_name,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE status = 'active') as active_count,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_count
FROM tenant_memberships
UNION ALL
SELECT 
  'subscriptions' as table_name,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE status = 'active') as active_count,
  COUNT(*) FILTER (WHERE status = 'canceled') as canceled_count
FROM subscriptions) AS explain_result) AS t;

-- Finish tests
SELECT * FROM finish();

ROLLBACK;