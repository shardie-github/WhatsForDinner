-- ============================================================================
-- Auto-Generated Supabase Fixes Migration
-- Generated: 2025-11-02T11:44:00Z
-- ============================================================================
-- This migration applies idempotent fixes for:
-- - Missing extensions
-- - Missing RLS policies
-- - Missing Realtime publications
-- - Storage buckets and policies
-- - Default RPC functions
-- ============================================================================
-- WARNING: Review this migration before applying to production
-- ============================================================================

-- ============================================================================
-- A. Extensions (idempotent)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pgjwt";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Vector extension for AI embeddings (if using pgvector)
-- Uncomment if needed:
-- CREATE EXTENSION IF NOT EXISTS "vector";

-- pg_cron requires superuser - enable manually if needed:
-- CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- ============================================================================
-- B. Ensure Realtime Publication
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

-- ============================================================================
-- C. Profiles Table & Trigger (enhanced version if missing)
-- ============================================================================

-- Enhance profiles table if it exists with basic structure
DO $$
BEGIN
  -- Add columns if they don't exist
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    -- Add email column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'email') THEN
      ALTER TABLE public.profiles ADD COLUMN email text;
    END IF;
    
    -- Add display_name column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'display_name') THEN
      ALTER TABLE public.profiles ADD COLUMN display_name text;
    END IF;
    
    -- Add avatar_url column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'avatar_url') THEN
      ALTER TABLE public.profiles ADD COLUMN avatar_url text;
    END IF;
    
    -- Add created_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'created_at') THEN
      ALTER TABLE public.profiles ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();
    END IF;
    
    -- Add updated_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'updated_at') THEN
      ALTER TABLE public.profiles ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
    END IF;
  ELSE
    -- Create profiles table if it doesn't exist
    CREATE TABLE public.profiles (
      id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      name text,
      preferences jsonb,
      email text,
      display_name text,
      avatar_url text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
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
END $$;

-- Auto-provision profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email)
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
-- D. Storage Buckets (common ones)
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
    WITH CHECK (bucket_id = 'assets' AND (owner = auth.uid() OR metadata->>'owner_id' = auth.uid()::text));
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
-- E. Common RPC Functions
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

-- ============================================================================
-- F. Add Tables to Realtime Publication
-- ============================================================================

-- Add profiles to realtime
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime'
    AND schemaname = 'public' 
    AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;
END $$;

-- ============================================================================
-- G. Helper: Enable RLS on existing tables (safe to run multiple times)
-- ============================================================================
-- This section can be expanded based on audit findings
-- For now, it ensures common tables have RLS enabled

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
    -- Enable RLS (idempotent)
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', 
      table_record.schemaname, table_record.tablename);
    
    -- Check if table has user_id, owner_id, or created_by
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = table_record.schemaname
        AND table_name = table_record.tablename
        AND column_name IN ('user_id', 'owner_id', 'created_by')
    ) THEN
      -- Determine owner column
      DECLARE
        owner_col TEXT;
      BEGIN
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
        
        -- Create read policy for authenticated (if missing)
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies
          WHERE schemaname = table_record.schemaname
            AND tablename = table_record.tablename
            AND policyname = format('%s_read_authenticated', table_record.tablename)
        ) THEN
          EXECUTE format(
            'CREATE POLICY %I ON %I.%I FOR SELECT TO authenticated USING (true)',
            format('%s_read_authenticated', table_record.tablename),
            table_record.schemaname,
            table_record.tablename
          );
        END IF;
        
        -- Create owner write policy (if missing)
        IF owner_col IS NOT NULL AND NOT EXISTS (
          SELECT 1 FROM pg_policies
          WHERE schemaname = table_record.schemaname
            AND tablename = table_record.tablename
            AND policyname = format('%s_write_owner', table_record.tablename)
        ) THEN
          EXECUTE format(
            'CREATE POLICY %I ON %I.%I FOR ALL TO authenticated USING (%I = auth.uid()) WITH CHECK (%I = auth.uid())',
            format('%s_write_owner', table_record.tablename),
            table_record.schemaname,
            table_record.tablename,
            owner_col,
            owner_col
          );
        END IF;
      END;
    END IF;
  END LOOP;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail migration
    RAISE WARNING 'Error processing table %: %', table_record.tablename, SQLERRM;
END $$;

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- Review AUDIT_SUPABASE.md for additional table-specific fixes needed
-- This migration is idempotent and safe to run multiple times
-- ============================================================================
