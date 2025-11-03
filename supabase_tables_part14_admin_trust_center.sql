-- ============================================================================
-- PART 14: ADMIN OPS & TRUST CENTER SCHEMA
-- Run after Part 13 (gapclosure)
-- ============================================================================

-- Create admin roles enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_role') THEN
    CREATE TYPE admin_role AS ENUM ('superadmin', 'finance', 'reviewer', 'support');
  END IF;
END $$;

-- Create admin status enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_status') THEN
    CREATE TYPE admin_status AS ENUM ('active', 'suspended');
  END IF;
END $$;

-- Create moderation entity kind enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'moderation_entity_kind') THEN
    CREATE TYPE moderation_entity_kind AS ENUM ('campaign', 'creative', 'partner', 'message');
  END IF;
END $$;

-- Create moderation priority enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'moderation_priority') THEN
    CREATE TYPE moderation_priority AS ENUM ('low', 'normal', 'high');
  END IF;
END $$;

-- Create moderation status enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'moderation_status') THEN
    CREATE TYPE moderation_status AS ENUM ('open', 'in_review', 'resolved', 'escalated');
  END IF;
END $$;

-- Create incident severity enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'incident_severity') THEN
    CREATE TYPE incident_severity AS ENUM ('low', 'major', 'critical');
  END IF;
END $$;

-- Create incident status enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'incident_status') THEN
    CREATE TYPE incident_status AS ENUM ('open', 'mitigated', 'closed');
  END IF;
END $$;

-- Create data access action enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'data_access_action') THEN
    CREATE TYPE data_access_action AS ENUM ('read', 'export', 'delete', 'modify');
  END IF;
END $$;

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  role admin_role NOT NULL,
  status admin_status DEFAULT 'active' NOT NULL,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS admin_users_email_idx ON admin_users(email);
CREATE INDEX IF NOT EXISTS admin_users_role_idx ON admin_users(role);
CREATE INDEX IF NOT EXISTS admin_users_status_idx ON admin_users(status);

-- Audit logs table (immutable, append-only)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  entity_kind TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL,
  before JSONB,
  after JSONB,
  reason TEXT,
  ts TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  signature TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS audit_logs_actor_id_idx ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS audit_logs_entity_idx ON audit_logs(entity_kind, entity_id);
CREATE INDEX IF NOT EXISTS audit_logs_ts_idx ON audit_logs(ts);
CREATE INDEX IF NOT EXISTS audit_logs_signature_idx ON audit_logs(signature);

-- Moderation queue table
CREATE TABLE IF NOT EXISTS moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_kind moderation_entity_kind NOT NULL,
  entity_id UUID NOT NULL,
  priority moderation_priority DEFAULT 'normal' NOT NULL,
  status moderation_status DEFAULT 'open' NOT NULL,
  flag_reason TEXT,
  assigned_to UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS moderation_queue_entity_idx ON moderation_queue(entity_kind, entity_id);
CREATE INDEX IF NOT EXISTS moderation_queue_status_idx ON moderation_queue(status);
CREATE INDEX IF NOT EXISTS moderation_queue_priority_idx ON moderation_queue(priority);
CREATE INDEX IF NOT EXISTS moderation_queue_assigned_idx ON moderation_queue(assigned_to);

-- Incidents table
CREATE TABLE IF NOT EXISTS incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  severity incident_severity DEFAULT 'low' NOT NULL,
  summary TEXT NOT NULL,
  opened_by UUID REFERENCES admin_users(id) ON DELETE SET NULL NOT NULL,
  status incident_status DEFAULT 'open' NOT NULL,
  timeline JSONB DEFAULT '[]'::jsonb NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  closed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS incidents_status_idx ON incidents(status);
CREATE INDEX IF NOT EXISTS incidents_severity_idx ON incidents(severity);
CREATE INDEX IF NOT EXISTS incidents_opened_by_idx ON incidents(opened_by);

-- Data access logs table
CREATE TABLE IF NOT EXISTS data_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  action data_access_action NOT NULL,
  resource TEXT NOT NULL,
  success BOOLEAN DEFAULT true NOT NULL,
  ts TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS data_access_logs_user_id_idx ON data_access_logs(user_id);
CREATE INDEX IF NOT EXISTS data_access_logs_admin_id_idx ON data_access_logs(admin_id);
CREATE INDEX IF NOT EXISTS data_access_logs_ts_idx ON data_access_logs(ts);
CREATE INDEX IF NOT EXISTS data_access_logs_resource_idx ON data_access_logs(resource);

-- Retention policies table
CREATE TABLE IF NOT EXISTS retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL UNIQUE,
  days INTEGER NOT NULL,
  auto_purge BOOLEAN DEFAULT true NOT NULL,
  last_run_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS retention_policies_category_idx ON retention_policies(category);

-- Row Level Security (RLS) Policies

-- Admin users: only admins can read
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_users_select ON admin_users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
      AND au.status = 'active'
      AND au.role IN ('superadmin', 'finance', 'reviewer', 'support')
    )
  );

-- Audit logs: append-only, readable by all admins
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_logs_select ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
      AND au.status = 'active'
    )
  );

CREATE POLICY audit_logs_insert ON audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true); -- System inserts only

-- Moderation queue: reviewers and superadmins
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY moderation_queue_select ON moderation_queue
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
      AND au.status = 'active'
      AND au.role IN ('superadmin', 'reviewer')
    )
  );

CREATE POLICY moderation_queue_insert ON moderation_queue
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
      AND au.status = 'active'
    )
  );

-- Incidents: all admins can read, support+ can create
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY incidents_select ON incidents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
      AND au.status = 'active'
    )
  );

CREATE POLICY incidents_insert ON incidents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
      AND au.status = 'active'
      AND au.role IN ('superadmin', 'support')
    )
  );

-- Retention policies: superadmin only
ALTER TABLE retention_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY retention_policies_select ON retention_policies
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
      AND au.status = 'active'
      AND au.role = 'superadmin'
    )
  );

-- Seed default retention policies
INSERT INTO retention_policies (category, days, auto_purge)
VALUES
  ('clicks', 365, true),
  ('conversions', 730, true),
  ('events', 180, true),
  ('audit_logs', 1825, false)
ON CONFLICT (category) DO NOTHING;

-- Seed default superadmin (password should be set via admin auth system)
-- DO NOT use this in production without proper password hashing!
-- INSERT INTO admin_users (email, role, status)
-- VALUES ('admin@nomad.app', 'superadmin', 'active')
-- ON CONFLICT (email) DO NOTHING;
