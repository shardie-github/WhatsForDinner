# Supabase Advisor Prompt

Copy and paste this prompt into Supabase Advisor to get help integrating the audit findings:

---

## Prompt for Supabase Advisor

```
I've completed a comprehensive database audit of my Supabase project and generated fixes. Please help me integrate these into my Supabase project.

### Context
- Project Type: Supabase (PostgreSQL) with Edge Functions
- Audit Status: Repository audit complete, need to verify and apply live database fixes
- Migration Strategy: Idempotent SQL using IF NOT EXISTS patterns

### Audit Findings Summary

1. **Extensions Needed:**
   - uuid-ossp, pgcrypto, pgjwt, pg_stat_statements, pg_trgm
   - Optional: vector (for AI embeddings), pg_cron (requires superuser)

2. **Row Level Security (RLS):**
   - Most tables have RLS enabled from migrations
   - Need to ensure ALL user tables have RLS enabled
   - Need default policies: authenticated read + owner write (where user_id/owner_id/created_by exists)

3. **Realtime Publication:**
   - Need to ensure supabase_realtime publication exists
   - Add common tables (profiles, recipes, etc.) to publication as needed

4. **Storage Buckets:**
   - Need default buckets: 'assets' (public, 50MB) and 'avatars' (public, 2MB)
   - Need owner-based RLS policies for storage.objects

5. **Edge Functions:**
   - 4 functions found: search-ai, api, generate-meal, job-processor
   - All should have deno.json configuration files

6. **RPC Functions:**
   - Created get_current_user_profile() helper function

### Migration SQL to Apply

I have a migration file (202511021144__auto_fixes.sql) that includes:

1. Extensions (IF NOT EXISTS)
2. Realtime publication setup
3. Profiles table enhancements (email, display_name, avatar_url, timestamps)
4. Auto-provision profile trigger (handle_new_user)
5. Storage buckets (assets, avatars) with policies
6. Automatic RLS enablement for all public tables
7. Owner-based write policies (auto-detects user_id, owner_id, created_by columns)
8. RPC function: get_current_user_profile()

### What I Need Help With

1. **Verification:**
   - Run the catalog queries below to check current database state
   - Compare against what's in migrations
   - Identify any drift or missing pieces

2. **Migration Application:**
   - Review the auto-fix migration for safety
   - Apply it to my database (using service_role or direct SQL execution)
   - Verify all changes were applied correctly

3. **Post-Application Checks:**
   - Verify RLS is enabled on all user tables
   - Verify policies exist for authenticated read
   - Verify owner write policies where owner columns exist
   - Verify storage buckets exist with correct policies
   - Verify Realtime publication membership

4. **Edge Cases:**
   - Tables without clear owner columns (need manual policy review)
   - Tables that should be in Realtime but aren't
   - Any conflicting policies or permissions

5. **Performance:**
   - Review if additional indexes are needed
   - Check if any policies are too permissive
   - Suggest optimizations

### Catalog Queries to Run

Please run these queries and share the results:

```sql
-- 1. Check RLS status on all tables
SELECT 
  n.nspname as schema, 
  c.relname as table_name, 
  c.relrowsecurity as rls_enabled, 
  c.relforcerowsecurity as rls_forced
FROM pg_class c 
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'r' 
  AND n.nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
ORDER BY schema, table_name;

-- 2. Check existing policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd, 
  roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. Check Realtime publication
SELECT 
  p.pubname, 
  t.schemaname, 
  t.tablename
FROM pg_publication p
LEFT JOIN pg_publication_tables t ON t.pubname = p.pubname
WHERE p.pubname = 'supabase_realtime'
ORDER BY t.schemaname, t.tablename;

-- 4. Check storage buckets
SELECT id, name, public, file_size_limit
FROM storage.buckets
ORDER BY name;

-- 5. Check storage policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd, 
  qual
FROM pg_policies
WHERE schemaname = 'storage'
ORDER BY tablename, policyname;

-- 6. Check extensions
SELECT extname, extversion
FROM pg_extension
ORDER BY extname;

-- 7. Check RPC functions
SELECT 
  n.nspname as schema, 
  p.proname as function_name,
  CASE 
    WHEN p.prosecdef THEN 'security definer'
    ELSE 'security invoker'
  END as security_type
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname IN ('public', 'rpc')
ORDER BY schema, function_name;
```

### Migration File Contents

Here's the migration SQL I want to apply:

```sql
-- (Paste contents of supabase/migrations/202511021144__auto_fixes.sql here)
```

### Questions

1. Is this migration safe to run on a production database?
2. Are there any conflicts with existing policies or configurations?
3. Should I run this in one transaction or can it be run piece by piece?
4. What should I monitor after applying this migration?
5. Are there any tables in my database that don't have owner columns but should have write policies?

### Additional Context

- I'm using Supabase for a multi-tenant SaaS application
- I have tables for: profiles, recipes, pantry_items, analytics, AI embeddings, multi-tenant data
- I want to ensure all user data is properly secured with RLS
- I need real-time updates for certain tables (profiles, recipes, community posts)

Please help me:
1. Review the current state
2. Safely apply the migration
3. Verify everything is working correctly
4. Identify any gaps or improvements needed

Thank you!
```

---

## Alternative: Short Version

If you need a shorter prompt, use this:

```
I need help applying a database security and configuration audit migration to my Supabase project. 

The migration includes:
- Enabling extensions (uuid-ossp, pgcrypto, pgjwt, pg_stat_statements, pg_trgm)
- Setting up Realtime publication
- Enhancing profiles table with missing columns and auto-provision trigger
- Creating storage buckets (assets, avatars) with RLS policies
- Enabling RLS on all public tables
- Creating default authenticated read + owner write policies
- Adding get_current_user_profile() RPC function

Can you:
1. Review the migration SQL for safety?
2. Help me apply it to my database?
3. Verify RLS is properly configured on all tables?
4. Check storage buckets and policies are correct?

The migration uses IF NOT EXISTS patterns and should be idempotent. I'm concerned about:
- Tables without clear owner columns
- Potential conflicts with existing policies
- Ensuring all user data is properly secured

[Paste your migration SQL here]
```

---

## How to Use

1. **Open Supabase Dashboard** ? Your Project ? SQL Editor (or use Supabase Advisor)
2. **Copy the prompt** above (full or short version)
3. **Paste your migration SQL** from `supabase/migrations/202511021144__auto_fixes.sql` into the prompt where indicated
4. **Submit** to Supabase Advisor
5. **Follow** the recommendations provided

---

## What to Expect

Supabase Advisor should help you:
- ? Verify the migration is safe
- ? Identify any conflicts
- ? Apply the migration correctly
- ? Verify RLS policies are working
- ? Suggest improvements or missing pieces

---

## Follow-up Questions to Ask

After initial integration, you can ask:
1. "Which tables don't have owner columns and need manual policy review?"
2. "Should I add any tables to the Realtime publication?"
3. "Are my storage policies too permissive or too restrictive?"
4. "Do I need additional indexes for performance?"
5. "How do I test that RLS is working correctly?"
