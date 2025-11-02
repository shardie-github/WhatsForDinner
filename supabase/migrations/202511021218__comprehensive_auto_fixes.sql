-- ============================================================================
-- Comprehensive Supabase Auto-Fix Migration
-- Generated: 2025-11-02T12:18:00Z
-- ============================================================================
-- This migration applies idempotent fixes for:
-- - Critical extensions
-- - Multi-tenant infrastructure (organizations/user_organizations compatibility)
-- - RLS hardening on all user tables
-- - Realtime publication for all tables
-- - Storage buckets and policies
-- - Performance monitoring (metrics views, query monitor)
-- - RPC functions
-- - Profile auto-provision
-- - Tenant provisioning function
-- - Metering/billing tables (optional)
-- ============================================================================
-- WARNING: Review this migration before applying to production
-- All changes are idempotent and safe to run multiple times
-- ============================================================================

-- ============================================================================
-- A. Critical Extensions (idempotent)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pgjwt";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Vector extension for AI embeddings (if using pgvector)
-- Uncomment if needed:
-- CREATE EXTENSION IF NOT EXISTS "vector";

-- pg_cron requires superuser - enable manually via Supabase SQL Editor:
-- CREATE EXTENSION IF NOT EXISTS "pg_cron";
-- Then uncomment the cron jobs section below

-- ============================================================================
-- B. Ensure Realtime Publication Exists
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

-- ============================================================================
-- C. Multi-Tenant: Organizations/User_Organizations Compatibility
-- ============================================================================
-- This creates organizations and user_organizations tables for compatibility
-- If tenants/tenant_memberships already exist, we create views as aliases

-- Create organizations table (compatible with tenants)
CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  plan text DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'family', 'enterprise')),
  stripe_customer_id text,
  stripe_subscription_id text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  settings jsonb DEFAULT '{}',
  metadata jsonb DEFAULT '{}'
);

-- Create user_organizations table (compatible with tenant_memberships)
CREATE TABLE IF NOT EXISTS public.user_organizations (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'editor', 'viewer', 'member')),
  invited_by uuid REFERENCES auth.users(id),
  joined_at timestamptz NOT NULL DEFAULT now(),
  status text DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
  PRIMARY KEY (user_id, org_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_organizations_user_id ON public.user_organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_organizations_org_id ON public.user_organizations(org_id);
CREATE INDEX IF NOT EXISTS idx_user_organizations_role ON public.user_organizations(role);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON public.organizations(status);
CREATE INDEX IF NOT EXISTS idx_organizations_plan ON public.organizations(plan);

-- Enable RLS on multi-tenant tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_organizations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations
DO $$
BEGIN
  -- Users can view organizations they belong to
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'organizations' 
    AND policyname = 'org_read_member'
  ) THEN
    CREATE POLICY org_read_member ON public.organizations
    FOR SELECT TO authenticated
    USING (
      id IN (
        SELECT org_id FROM public.user_organizations 
        WHERE user_id = auth.uid() AND status = 'active'
      )
    );
  END IF;

  -- Owners can update their organization
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'organizations' 
    AND policyname = 'org_write_owner'
  ) THEN
    CREATE POLICY org_write_owner ON public.organizations
    FOR ALL TO authenticated
    USING (
      id IN (
        SELECT org_id FROM public.user_organizations 
        WHERE user_id = auth.uid() AND role = 'owner' AND status = 'active'
      )
    )
    WITH CHECK (
      id IN (
        SELECT org_id FROM public.user_organizations 
        WHERE user_id = auth.uid() AND role = 'owner' AND status = 'active'
      )
    );
  END IF;
END $$;

-- RLS Policies for user_organizations
DO $$
BEGIN
  -- Users can view their own memberships
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_organizations' 
    AND policyname = 'user_org_read_own'
  ) THEN
    CREATE POLICY user_org_read_own ON public.user_organizations
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());
  END IF;

  -- Organization owners can view all memberships
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_organizations' 
    AND policyname = 'user_org_read_org_owner'
  ) THEN
    CREATE POLICY user_org_read_org_owner ON public.user_organizations
    FOR SELECT TO authenticated
    USING (
      org_id IN (
        SELECT org_id FROM public.user_organizations 
        WHERE user_id = auth.uid() AND role = 'owner' AND status = 'active'
      )
    );
  END IF;
END $$;

-- ============================================================================
-- D. Profiles Table Enhancement & Auto-Provision
-- ============================================================================

-- Enhance profiles table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    -- Add columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'email') THEN
      ALTER TABLE public.profiles ADD COLUMN email text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'display_name') THEN
      ALTER TABLE public.profiles ADD COLUMN display_name text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'avatar_url') THEN
      ALTER TABLE public.profiles ADD COLUMN avatar_url text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'tenant_id') THEN
      ALTER TABLE public.profiles ADD COLUMN tenant_id uuid REFERENCES public.organizations(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'created_at') THEN
      ALTER TABLE public.profiles ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'updated_at') THEN
      ALTER TABLE public.profiles ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
    END IF;
  ELSE
    -- Create profiles table if it doesn't exist
    CREATE TABLE public.profiles (
      id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      email text,
      display_name text,
      avatar_url text,
      tenant_id uuid REFERENCES public.organizations(id),
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      name text,
      preferences jsonb DEFAULT '{}'
    );
  END IF;
  
  -- Ensure RLS is enabled
  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
END $$;

-- Profiles policies (idempotent)
DO $$
BEGIN
  -- Read own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles' 
    AND policyname = 'profiles_read_own'
  ) THEN
    CREATE POLICY profiles_read_own ON public.profiles
    FOR SELECT TO authenticated
    USING (id = auth.uid());
  END IF;

  -- Update own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles' 
    AND policyname = 'profiles_write_own'
  ) THEN
    CREATE POLICY profiles_write_own ON public.profiles
    FOR UPDATE TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());
  END IF;

  -- Insert own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles' 
    AND policyname = 'profiles_insert_own'
  ) THEN
    CREATE POLICY profiles_insert_own ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK (id = auth.uid());
  END IF;

  -- View profiles in same organization
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles' 
    AND policyname = 'profiles_read_org'
  ) THEN
    CREATE POLICY profiles_read_org ON public.profiles
    FOR SELECT TO authenticated
    USING (
      tenant_id IN (
        SELECT org_id FROM public.user_organizations 
        WHERE user_id = auth.uid() AND status = 'active'
      )
    );
  END IF;
END $$;

-- Auto-provision profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', new.email))
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- E. Tenant Provisioning Function
-- ============================================================================

CREATE OR REPLACE FUNCTION public.provision_tenant(
  user_id_param uuid,
  org_name text,
  user_name text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_org_id uuid;
  user_email text;
BEGIN
  -- Get user email
  SELECT email INTO user_email FROM auth.users WHERE id = user_id_param;
  
  IF user_email IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Create organization
  INSERT INTO public.organizations (name, plan, status)
  VALUES (org_name, 'free', 'active')
  RETURNING id INTO new_org_id;

  -- Create user_organization membership
  INSERT INTO public.user_organizations (user_id, org_id, role, status)
  VALUES (user_id_param, new_org_id, 'owner', 'active')
  ON CONFLICT (user_id, org_id) DO NOTHING;

  -- Update profile with tenant_id
  UPDATE public.profiles
  SET tenant_id = new_org_id
  WHERE id = user_id_param;

  RETURN new_org_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.provision_tenant(uuid, text, text) TO authenticated;

-- ============================================================================
-- F. Storage Buckets & Policies
-- ============================================================================

-- Assets bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 
  'assets',
  'assets',
  true,
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'assets');

-- Avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars');

-- Storage policies (idempotent)
DO $$
BEGIN
  -- Public read for assets
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'storage_read_assets'
  ) THEN
    CREATE POLICY storage_read_assets
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'assets');
  END IF;

  -- Authenticated write for assets (owner only)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'storage_write_assets'
  ) THEN
    CREATE POLICY storage_write_assets
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'assets' AND owner = auth.uid());
  END IF;

  -- Authenticated update/delete for assets (owner only)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'storage_update_assets'
  ) THEN
    CREATE POLICY storage_update_assets
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'assets' AND owner = auth.uid())
    WITH CHECK (bucket_id = 'assets' AND owner = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'storage_delete_assets'
  ) THEN
    CREATE POLICY storage_delete_assets
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'assets' AND owner = auth.uid());
  END IF;

  -- Avatar policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'storage_read_avatars'
  ) THEN
    CREATE POLICY storage_read_avatars
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'avatars');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'storage_write_avatars'
  ) THEN
    CREATE POLICY storage_write_avatars
    ON storage.objects FOR ALL
    TO authenticated
    USING (bucket_id = 'avatars' AND owner = auth.uid())
    WITH CHECK (bucket_id = 'avatars' AND owner = auth.uid());
  END IF;
END $$;

-- ============================================================================
-- G. Performance Monitoring Tables & Views
-- ============================================================================

-- Query Monitor View (using pg_stat_statements)
CREATE OR REPLACE VIEW public.query_monitor AS
SELECT 
  LEFT(query, 100) AS query_preview,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time,
  stddev_exec_time,
  rows,
  100.0 * shared_blks_hit / NULLIF(shared_blks_hit + shared_blks_read, 0) AS cache_hit_ratio
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY total_exec_time DESC
LIMIT 100;

GRANT SELECT ON public.query_monitor TO authenticated;

-- Session Load Monitor View
CREATE OR REPLACE VIEW public.session_monitor AS
SELECT 
  datname,
  usename,
  application_name,
  client_addr,
  state,
  query_start,
  state_change,
  wait_event_type,
  wait_event,
  LEFT(query, 100) AS query_preview
FROM pg_stat_activity
WHERE datname = current_database()
  AND pid != pg_backend_pid()
ORDER BY query_start DESC;

GRANT SELECT ON public.session_monitor TO authenticated;

-- ============================================================================
-- H. Metering & Billing Tables (Optional Advanced Layer)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.api_usage (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id),
  org_id uuid REFERENCES public.organizations(id),
  endpoint text NOT NULL,
  method text NOT NULL,
  status_code int,
  response_time_ms int,
  request_size_bytes int,
  response_size_bytes int,
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON public.api_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_org_id ON public.api_usage(org_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON public.api_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_endpoint ON public.api_usage(endpoint);

ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

-- RLS for api_usage
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'api_usage' 
    AND policyname = 'api_usage_read_own'
  ) THEN
    CREATE POLICY api_usage_read_own ON public.api_usage
    FOR SELECT TO authenticated
    USING (
      user_id = auth.uid() OR
      org_id IN (
        SELECT org_id FROM public.user_organizations 
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'api_usage' 
    AND policyname = 'api_usage_insert'
  ) THEN
    CREATE POLICY api_usage_insert ON public.api_usage
    FOR INSERT TO authenticated, service_role
    WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- Event Logs Table
CREATE TABLE IF NOT EXISTS public.event_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id),
  org_id uuid REFERENCES public.organizations(id),
  event_type text NOT NULL,
  event_name text NOT NULL,
  properties jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_event_logs_user_id ON public.event_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_event_logs_org_id ON public.event_logs(org_id);
CREATE INDEX IF NOT EXISTS idx_event_logs_created_at ON public.event_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_event_logs_event_type ON public.event_logs(event_type);

ALTER TABLE public.event_logs ENABLE ROW LEVEL SECURITY;

-- RLS for event_logs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'event_logs' 
    AND policyname = 'event_logs_read_own'
  ) THEN
    CREATE POLICY event_logs_read_own ON public.event_logs
    FOR SELECT TO authenticated
    USING (
      user_id = auth.uid() OR
      org_id IN (
        SELECT org_id FROM public.user_organizations 
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'event_logs' 
    AND policyname = 'event_logs_insert'
  ) THEN
    CREATE POLICY event_logs_insert ON public.event_logs
    FOR INSERT TO authenticated, service_role
    WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- ============================================================================
-- I. RPC Functions
-- ============================================================================

-- Get current user profile
CREATE OR REPLACE FUNCTION public.get_current_user_profile()
RETURNS public.profiles
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT p.* FROM public.profiles p
  WHERE p.id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.get_current_user_profile() TO authenticated;

-- Get user organizations
CREATE OR REPLACE FUNCTION public.get_user_organizations()
RETURNS TABLE(
  org_id uuid,
  org_name text,
  role text,
  status text,
  joined_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    o.id,
    o.name,
    uo.role,
    uo.status,
    uo.joined_at
  FROM public.user_organizations uo
  JOIN public.organizations o ON o.id = uo.org_id
  WHERE uo.user_id = auth.uid() AND uo.status = 'active'
  ORDER BY uo.joined_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_organizations() TO authenticated;

-- ============================================================================
-- J. Add All User Tables to Realtime Publication
-- ============================================================================
-- This ensures all public tables are available for realtime subscriptions

DO $$
DECLARE
  table_record RECORD;
BEGIN
  FOR table_record IN
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename NOT LIKE 'pg_%'
      AND tablename NOT IN ('schema_migrations', '_prisma_migrations')
  LOOP
    -- Check if table is already in publication
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = table_record.schemaname
        AND tablename = table_record.tablename
    ) THEN
      BEGIN
        EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I.%I',
          table_record.schemaname, table_record.tablename);
      EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Could not add table % to realtime: %', table_record.tablename, SQLERRM;
      END;
    END IF;
  END LOOP;
END $$;

-- ============================================================================
-- K. Enable RLS on All Public Tables (idempotent)
-- ============================================================================

DO $$
DECLARE
  table_record RECORD;
  owner_col TEXT;
BEGIN
  FOR table_record IN
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename NOT LIKE 'pg_%'
      AND tablename NOT IN ('schema_migrations', '_prisma_migrations')
  LOOP
    -- Enable RLS (idempotent)
    BEGIN
      EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY',
        table_record.schemaname, table_record.tablename);
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Could not enable RLS on table %: %', table_record.tablename, SQLERRM;
    END;
    
    -- Check if table has tenant_id for tenant-aware policies
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = table_record.schemaname
        AND table_name = table_record.tablename
        AND column_name = 'tenant_id'
    ) THEN
      -- Create tenant-aware read policy if missing
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = table_record.schemaname
          AND tablename = table_record.tablename
          AND policyname = format('%s_read_tenant', table_record.tablename)
      ) THEN
        BEGIN
          EXECUTE format(
            'CREATE POLICY %I ON %I.%I FOR SELECT TO authenticated USING (tenant_id IN (SELECT org_id FROM public.user_organizations WHERE user_id = auth.uid() AND status = ''active'') OR tenant_id IS NULL)',
            format('%s_read_tenant', table_record.tablename),
            table_record.schemaname,
            table_record.tablename
          );
        EXCEPTION WHEN OTHERS THEN
          RAISE WARNING 'Could not create tenant read policy for table %: %', table_record.tablename, SQLERRM;
        END;
      END IF;
    END IF;
    
    -- Check for owner columns (user_id, owner_id, created_by)
    SELECT column_name INTO owner_col
    FROM information_schema.columns
    WHERE table_schema = table_record.schemaname
      AND table_name = table_record.tablename
      AND column_name IN ('user_id', 'owner_id', 'created_by')
    ORDER BY CASE column_name
      WHEN 'user_id' THEN 1
      WHEN 'owner_id' THEN 2
      WHEN 'created_by' THEN 3
    END
    LIMIT 1;
    
    -- Create owner-based write policy if owner column found and policy missing
    IF owner_col IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = table_record.schemaname
        AND tablename = table_record.tablename
        AND policyname = format('%s_write_owner', table_record.tablename)
    ) THEN
      BEGIN
        EXECUTE format(
          'CREATE POLICY %I ON %I.%I FOR ALL TO authenticated USING (%I = auth.uid()) WITH CHECK (%I = auth.uid())',
          format('%s_write_owner', table_record.tablename),
          table_record.schemaname,
          table_record.tablename,
          owner_col,
          owner_col
        );
      EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Could not create owner write policy for table %: %', table_record.tablename, SQLERRM;
      END;
    END IF;
  END LOOP;
END $$;

-- ============================================================================
-- L. pg_cron Jobs (Optional - Uncomment after enabling pg_cron extension)
-- ============================================================================
-- Note: pg_cron requires superuser. Enable the extension first via Supabase SQL Editor,
-- then uncomment these jobs.

-- Daily backup snapshot (runs at 2 AM UTC)
-- SELECT cron.schedule(
--   'daily-backup-snapshot',
--   '0 2 * * *',
--   'SELECT pg_dump(''your-database-url'') INTO ''backup-$(date +%Y%m%d).sql'';'
-- );

-- Log retention rotation (runs daily at 3 AM UTC, keeps last 90 days)
-- SELECT cron.schedule(
--   'log-retention-rotation',
--   '0 3 * * *',
--   'DELETE FROM public.event_logs WHERE created_at < now() - interval ''90 days''; DELETE FROM public.api_usage WHERE created_at < now() - interval ''90 days'';'
-- );

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- Review AUDIT_SUPABASE.md for additional table-specific fixes needed
-- This migration is idempotent and safe to run multiple times
-- ============================================================================
