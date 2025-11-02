# Supabase Database Setup Guide

This guide will help you set up all database tables, RLS policies, indexes, and functions for your Whats-For-Dinner application.

## Quick Start

### Option 1: Automated Setup (Recommended)

If you have your Supabase database password, you can run:

```bash
# Install PostgreSQL client (if not already installed)
npm install --save-dev pg @types/pg

# Run the setup script
SUPABASE_URL=https://your-project.supabase.co \
SUPABASE_DB_PASSWORD=your-database-password \
npx tsx scripts/setup-supabase-direct.ts
```

### Option 2: Generate SQL File (Simplest)

Generate a consolidated SQL file and execute it manually:

```bash
npx tsx scripts/setup-supabase-simple.ts
```

This creates `supabase_setup.sql` which you can execute in the Supabase Dashboard SQL Editor.

### Option 3: Using Supabase CLI

```bash
# Generate the SQL file first
npx tsx scripts/setup-supabase-simple.ts

# Then use Supabase CLI
supabase db push --file supabase_setup.sql
```

## Getting Your Credentials

### 1. Supabase URL
- Go to your Supabase project dashboard
- Copy the **Project URL** (e.g., `https://xxxxx.supabase.co`)

### 2. Service Role Key
- Go to **Settings** ? **API**
- Copy the **service_role** key (not the anon key)

### 3. Database Password
- Go to **Settings** ? **Database**
- Under **Connection string**, you'll find the password
- OR reset it if you don't have it

### 4. Database Connection String (Alternative)
If you prefer using a connection string directly:
- Go to **Settings** ? **Database**
- Under **Connection string**, select **URI**
- Copy the connection string (looks like: `postgresql://postgres:[password]@...`)

## What Gets Created

The setup script will create:

### Core Tables
- `profiles` - User profiles
- `pantry_items` - User pantry items
- `recipes` - Recipe storage
- `favorites` - User favorites

### Multi-Tenant Tables
- `tenants` - Organizations
- `tenant_memberships` - Tenant membership
- `subscriptions` - Subscription management
- `usage_logs` - Usage tracking

### Analytics & Logging
- `analytics_events` - Event tracking
- `recipe_metrics` - Recipe performance
- `system_metrics` - System metrics
- `logs` - Application logs
- `error_reports` - Error tracking

### Growth & Marketing
- `growth_metrics` - Business metrics
- `referrals` - Referral system
- `funnel_events` - Conversion tracking
- `ab_test_experiments` - A/B testing
- `social_posts` - Social media posts
- `ugc_shares` - User-generated content

### Partner Ecosystem
- `partner_registry` - Partner management
- `api_usage_tracking` - API usage
- `federated_api_endpoints` - API routing

### AI System
- `ai_health_metrics` - AI system health
- `ai_embeddings` - Vector embeddings
- `ai_performance_metrics` - AI performance
- `ai_config` - AI configuration

### Community & Features
- `community_posts` - Community content
- `chef_profiles` - Chef marketplace
- `feature_flags` - Feature toggles

And many more tables for a complete SaaS platform!

## Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:
- Users can only access data from their tenant
- Service role has full access for system operations
- Proper isolation between tenants

## Functions & Indexes

The setup also creates:
- Database functions for common operations
- Indexes for optimal query performance
- Triggers for automatic timestamp updates
- Helper functions for tenant management

## Troubleshooting

### Error: "already exists"
This is normal if you're re-running migrations. The script handles this gracefully.

### Error: "permission denied"
Make sure you're using the **service_role** key, not the anon key.

### Error: "connection refused"
- Check your Supabase URL
- Verify your database password
- Ensure your IP is not blocked

### Error: "relation does not exist"
Some migrations depend on others. Make sure all migrations run in order.

## Manual Setup

If automated setup fails, you can manually execute SQL:

1. Generate the SQL file:
   ```bash
   npx tsx scripts/setup-supabase-simple.ts
   ```

2. Go to Supabase Dashboard ? SQL Editor

3. Copy and paste the contents of `supabase_setup.sql`

4. Click "Run" to execute

## Verification

After setup, verify your tables:

1. Go to Supabase Dashboard ? Table Editor
2. You should see all the tables listed above
3. Try creating a test record to ensure RLS is working

## Need Help?

- Check Supabase documentation: https://supabase.com/docs
- Review migration files in `whats-for-dinner/supabase/migrations/`
- Check error messages for specific issues
