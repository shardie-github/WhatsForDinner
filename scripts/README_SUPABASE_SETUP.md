# Supabase Database Setup Scripts

I've created multiple scripts to help you set up your Supabase database with all tables, RLS policies, indexes, and functions.

## Available Scripts

### 1. `setup-supabase-simple.ts` (Simplest - Recommended for most users)
**What it does:** Generates a consolidated SQL file that you can execute manually.

**Usage:**
```bash
npx tsx scripts/setup-supabase-simple.ts
```

**Then:**
- Go to Supabase Dashboard ? SQL Editor
- Copy/paste the generated `supabase_setup.sql`
- Click "Run"

**Pros:** No credentials needed, works for everyone
**Cons:** Manual execution required

---

### 2. `setup-supabase-direct.ts` (Automated - Best for power users)
**What it does:** Directly connects to your database and executes all migrations automatically.

**Prerequisites:**
- Install: `npm install --save-dev pg @types/pg`
- Get your database password from Supabase Dashboard ? Settings ? Database

**Usage:**
```bash
# Option 1: Using database password
SUPABASE_URL=https://your-project.supabase.co \
SUPABASE_DB_PASSWORD=your-db-password \
npx tsx scripts/setup-supabase-direct.ts

# Option 2: Using full connection string
DATABASE_URL=postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres \
npx tsx scripts/setup-supabase-direct.ts
```

**Pros:** Fully automated, provides progress feedback
**Cons:** Requires database password/connection string

---

### 3. `setup-supabase-api.ts` (Alternative)
**What it does:** Attempts to use Supabase REST API (currently generates SQL file as fallback).

**Usage:**
```bash
SUPABASE_URL=https://your-project.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
npx tsx scripts/setup-supabase-api.ts
```

**Pros:** Uses API credentials you already have
**Cons:** Currently falls back to file generation (Supabase JS doesn't support direct SQL execution)

---

## Which Script Should You Use?

- **First time / Want simplicity?** ? Use `setup-supabase-simple.ts`
- **Want automation?** ? Use `setup-supabase-direct.ts` (requires database password)
- **Have API keys but no DB password?** ? Use `setup-supabase-simple.ts` then execute manually

## Getting Your Credentials

### For `setup-supabase-direct.ts`:

1. **Database Password:**
   - Go to Supabase Dashboard ? Settings ? Database
   - Find "Connection string" section
   - Look for password in connection string OR reset it if needed

2. **Connection String (Alternative):**
   - Same location as above
   - Select "URI" format
   - Copy the full connection string

### For `setup-supabase-api.ts`:

1. **Service Role Key:**
   - Go to Supabase Dashboard ? Settings ? API
   - Copy the `service_role` key (keep this secret!)

## What Gets Created

The scripts will set up:

? **Core Tables:** profiles, pantry_items, recipes, favorites  
? **Multi-Tenant:** tenants, tenant_memberships, subscriptions  
? **Analytics:** analytics_events, recipe_metrics, system_metrics  
? **Growth:** referrals, funnel_events, ab_test_experiments  
? **Partner API:** partner_registry, api_usage_tracking  
? **AI System:** ai_health_metrics, ai_embeddings, ai_performance_metrics  
? **Community:** community_posts, chef_profiles  
? **And 30+ more tables...**

Plus:
- Row Level Security (RLS) policies for data isolation
- Database indexes for performance
- Helper functions for common operations
- Triggers for automatic updates

## Troubleshooting

### "already exists" errors
These are normal if re-running. The script handles them gracefully.

### Connection errors
- Verify your Supabase URL is correct
- Check your database password
- Ensure your IP isn't blocked

### Missing tables
- Check if all migrations executed
- Review error messages
- Some tables depend on others - ensure correct execution order

## Next Steps

After setup:

1. **Verify tables:** Go to Supabase Dashboard ? Table Editor
2. **Test RLS:** Try creating a record to ensure security policies work
3. **Check functions:** View database functions in Dashboard ? Database ? Functions
4. **Update environment:** Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in your app

## Need Help?

- Check the main guide: `SUPABASE_SETUP.md`
- Review migration files in `whats-for-dinner/supabase/migrations/`
- Supabase docs: https://supabase.com/docs
