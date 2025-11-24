-- Privacy-First Usage Monitoring Migration
-- Implements zero-trust, user-only access with RLS and encryption

-- ============================================================================
-- SECTION 1: EXTENSIONS
-- ============================================================================

-- Enable pgcrypto for encryption at rest
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- SECTION 2: ENUMS
-- ============================================================================

CREATE TYPE monitoring_scope AS ENUM ('metadata_only', 'metadata_plus_usage', 'none');
CREATE TYPE telemetry_event_type AS ENUM ('app_focus', 'app_switch', 'window_change', 'duration', 'interaction');
CREATE TYPE transparency_log_action AS ENUM (
  'consent_granted',
  'consent_revoked',
  'app_added',
  'app_removed',
  'signal_toggled',
  'data_exported',
  'data_deleted',
  'policy_changed',
  'mfa_verified',
  'session_elevated'
);

-- ============================================================================
-- SECTION 3: TABLES
-- ============================================================================

-- Privacy preferences table
CREATE TABLE IF NOT EXISTS privacy_prefs (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  monitoring_enabled BOOLEAN NOT NULL DEFAULT false,
  data_retention_days INTEGER NOT NULL DEFAULT 14,
  mfa_required BOOLEAN NOT NULL DEFAULT true,
  last_reviewed_at TIMESTAMPTZ,
  paused_until TIMESTAMPTZ,
  kill_switch_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS privacy_prefs_user_id_idx ON privacy_prefs(user_id);

-- App allowlist table
CREATE TABLE IF NOT EXISTS app_allowlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  app_id TEXT NOT NULL,
  app_name TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  scope monitoring_scope NOT NULL DEFAULT 'metadata_only',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, app_id)
);

CREATE INDEX IF NOT EXISTS app_allowlist_user_id_idx ON app_allowlist(user_id);
CREATE INDEX IF NOT EXISTS app_allowlist_app_id_idx ON app_allowlist(app_id);

-- Signal toggles table
CREATE TABLE IF NOT EXISTS signal_toggles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  signal_key TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  sampling_rate NUMERIC(3, 2) NOT NULL DEFAULT 1.0 CHECK (sampling_rate >= 0 AND sampling_rate <= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, signal_key)
);

CREATE INDEX IF NOT EXISTS signal_toggles_user_id_idx ON signal_toggles(user_id);
CREATE INDEX IF NOT EXISTS signal_toggles_signal_key_idx ON signal_toggles(signal_key);

-- Telemetry events table (encrypted at rest)
CREATE TABLE IF NOT EXISTS telemetry_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  app_id TEXT NOT NULL,
  event_type telemetry_event_type NOT NULL,
  duration_ms INTEGER,
  metadata_redacted_json JSONB NOT NULL DEFAULT '{}',
  encrypted_payload TEXT, -- pgcrypto encrypted sensitive fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS telemetry_events_user_id_idx ON telemetry_events(user_id);
CREATE INDEX IF NOT EXISTS telemetry_events_ts_idx ON telemetry_events(ts);
CREATE INDEX IF NOT EXISTS telemetry_events_app_id_idx ON telemetry_events(app_id);
CREATE INDEX IF NOT EXISTS telemetry_events_user_ts_idx ON telemetry_events(user_id, ts);

-- Privacy transparency log table (immutable append-only)
CREATE TABLE IF NOT EXISTS privacy_transparency_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action transparency_log_action NOT NULL,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  entity_type TEXT,
  entity_id UUID,
  old_value_hash TEXT,
  new_value_hash TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS privacy_transparency_log_user_id_idx ON privacy_transparency_log(user_id);
CREATE INDEX IF NOT EXISTS privacy_transparency_log_ts_idx ON privacy_transparency_log(ts);
CREATE INDEX IF NOT EXISTS privacy_transparency_log_action_idx ON privacy_transparency_log(action);

-- MFA enforced sessions table
CREATE TABLE IF NOT EXISTS mfa_enforced_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  action_type TEXT NOT NULL,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS mfa_enforced_sessions_user_id_idx ON mfa_enforced_sessions(user_id);
CREATE INDEX IF NOT EXISTS mfa_enforced_sessions_session_token_idx ON mfa_enforced_sessions(session_token);
CREATE INDEX IF NOT EXISTS mfa_enforced_sessions_expires_at_idx ON mfa_enforced_sessions(expires_at);

-- ============================================================================
-- SECTION 4: ROW LEVEL SECURITY (ZERO-TRUST, USER-ONLY)
-- ============================================================================

-- Enable RLS on all privacy tables
ALTER TABLE privacy_prefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_allowlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE signal_toggles ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_transparency_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE mfa_enforced_sessions ENABLE ROW LEVEL SECURITY;

-- Privacy preferences policies
CREATE POLICY "privacy_prefs_user_select"
  ON privacy_prefs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "privacy_prefs_user_insert"
  ON privacy_prefs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "privacy_prefs_user_update"
  ON privacy_prefs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- App allowlist policies
CREATE POLICY "app_allowlist_user_select"
  ON app_allowlist FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "app_allowlist_user_insert"
  ON app_allowlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "app_allowlist_user_update"
  ON app_allowlist FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "app_allowlist_user_delete"
  ON app_allowlist FOR DELETE
  USING (auth.uid() = user_id);

-- Signal toggles policies
CREATE POLICY "signal_toggles_user_select"
  ON signal_toggles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "signal_toggles_user_insert"
  ON signal_toggles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "signal_toggles_user_update"
  ON signal_toggles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "signal_toggles_user_delete"
  ON signal_toggles FOR DELETE
  USING (auth.uid() = user_id);

-- Telemetry events policies (NO ADMIN ACCESS)
CREATE POLICY "telemetry_events_user_select"
  ON telemetry_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "telemetry_events_user_insert"
  ON telemetry_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "telemetry_events_user_delete"
  ON telemetry_events FOR DELETE
  USING (auth.uid() = user_id);

-- NO UPDATE POLICY - telemetry events are immutable
-- NO ADMIN SELECT POLICY - zero-trust, user-only access

-- Privacy transparency log policies (immutable append-only)
CREATE POLICY "privacy_transparency_log_user_select"
  ON privacy_transparency_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "privacy_transparency_log_user_insert"
  ON privacy_transparency_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- NO UPDATE/DELETE POLICY - transparency log is immutable

-- MFA enforced sessions policies
CREATE POLICY "mfa_enforced_sessions_user_select"
  ON mfa_enforced_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "mfa_enforced_sessions_user_insert"
  ON mfa_enforced_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "mfa_enforced_sessions_user_delete"
  ON mfa_enforced_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- SECTION 5: ENCRYPTION FUNCTIONS
-- ============================================================================

-- Function to encrypt sensitive telemetry payload
CREATE OR REPLACE FUNCTION encrypt_telemetry_payload(payload TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  encryption_key TEXT;
BEGIN
  -- Use environment variable or default key (should be set via Supabase secrets)
  encryption_key := current_setting('app.telemetry_encryption_key', true);
  IF encryption_key IS NULL OR encryption_key = '' THEN
    -- Fallback: use a key derived from user context (NOT RECOMMENDED FOR PRODUCTION)
    encryption_key := 'default_key_change_in_production';
  END IF;
  
  RETURN pgp_sym_encrypt(payload, encryption_key);
END;
$$;

-- Function to decrypt telemetry payload
CREATE OR REPLACE FUNCTION decrypt_telemetry_payload(encrypted_payload TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  encryption_key TEXT;
BEGIN
  encryption_key := current_setting('app.telemetry_encryption_key', true);
  IF encryption_key IS NULL OR encryption_key = '' THEN
    encryption_key := 'default_key_change_in_production';
  END IF;
  
  RETURN pgp_sym_decrypt(encrypted_payload, encryption_key);
END;
$$;

-- ============================================================================
-- SECTION 6: HELPER FUNCTIONS
-- ============================================================================

-- Function to check if user has elevated MFA session
CREATE OR REPLACE FUNCTION has_elevated_mfa_session(user_id_param UUID, action_type_param TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM mfa_enforced_sessions
    WHERE mfa_enforced_sessions.user_id = user_id_param
      AND mfa_enforced_sessions.action_type = action_type_param
      AND mfa_enforced_sessions.expires_at > NOW()
      AND mfa_enforced_sessions.session_token IS NOT NULL
  );
$$;

-- Function to create transparency log entry (immutable)
CREATE OR REPLACE FUNCTION log_privacy_action(
  p_user_id UUID,
  p_action transparency_log_action,
  p_actor_id UUID,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_old_value_hash TEXT DEFAULT NULL,
  p_new_value_hash TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO privacy_transparency_log (
    user_id,
    action,
    actor_id,
    entity_type,
    entity_id,
    old_value_hash,
    new_value_hash,
    metadata
  ) VALUES (
    p_user_id,
    p_action,
    p_actor_id,
    p_entity_type,
    p_entity_id,
    p_old_value_hash,
    p_new_value_hash,
    p_metadata
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Function to check if kill-switch is active (environment-level)
CREATE OR REPLACE FUNCTION is_privacy_kill_switch_active()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    current_setting('app.privacy_kill_switch', true)::boolean,
    false
  );
$$;

-- ============================================================================
-- SECTION 7: TRIGGERS
-- ============================================================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER privacy_prefs_updated_at
  BEFORE UPDATE ON privacy_prefs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER app_allowlist_updated_at
  BEFORE UPDATE ON app_allowlist
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER signal_toggles_updated_at
  BEFORE UPDATE ON signal_toggles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to log privacy preference changes
CREATE OR REPLACE FUNCTION log_privacy_prefs_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  old_hash TEXT;
  new_hash TEXT;
BEGIN
  -- Generate hash of old and new values for audit
  old_hash := encode(digest(row_to_json(OLD)::text, 'sha256'), 'hex');
  new_hash := encode(digest(row_to_json(NEW)::text, 'sha256'), 'hex');
  
  IF OLD.monitoring_enabled != NEW.monitoring_enabled THEN
    PERFORM log_privacy_action(
      NEW.user_id,
      CASE WHEN NEW.monitoring_enabled THEN 'consent_granted' ELSE 'consent_revoked' END,
      NEW.user_id,
      'privacy_prefs',
      NEW.user_id,
      old_hash,
      new_hash,
      jsonb_build_object(
        'old_monitoring_enabled', OLD.monitoring_enabled,
        'new_monitoring_enabled', NEW.monitoring_enabled
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER privacy_prefs_log_changes
  AFTER UPDATE ON privacy_prefs
  FOR EACH ROW
  EXECUTE FUNCTION log_privacy_prefs_changes();

-- ============================================================================
-- SECTION 8: CLEANUP FUNCTION (for data retention)
-- ============================================================================

-- Function to purge expired telemetry events based on user retention policy
CREATE OR REPLACE FUNCTION purge_expired_telemetry()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER := 0;
  user_pref RECORD;
BEGIN
  FOR user_pref IN
    SELECT user_id, data_retention_days
    FROM privacy_prefs
    WHERE monitoring_enabled = true
  LOOP
    DELETE FROM telemetry_events
    WHERE telemetry_events.user_id = user_pref.user_id
      AND telemetry_events.ts < NOW() - (user_pref.data_retention_days || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = deleted_count + ROW_COUNT;
  END LOOP;
  
  RETURN deleted_count;
END;
$$;

-- ============================================================================
-- SECTION 9: GUARDIAN ROLE (system health only, no user data access)
-- ============================================================================

-- Create guardian role that can only check system health counters
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'privacy_guardian') THEN
    CREATE ROLE privacy_guardian;
  END IF;
END
$$;

-- Grant read-only access to aggregate counts only (no user data)
CREATE OR REPLACE FUNCTION get_privacy_health_stats()
RETURNS TABLE(
  total_users_opted_in BIGINT,
  total_apps_monitored BIGINT,
  total_events_today BIGINT,
  avg_retention_days NUMERIC,
  export_jobs_count BIGINT,
  delete_jobs_count BIGINT
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    COUNT(*) FILTER (WHERE monitoring_enabled = true)::BIGINT AS total_users_opted_in,
    COUNT(*) FILTER (WHERE enabled = true)::BIGINT AS total_apps_monitored,
    COUNT(*) FILTER (WHERE DATE(ts) = CURRENT_DATE)::BIGINT AS total_events_today,
    AVG(data_retention_days)::NUMERIC AS avg_retention_days,
    COUNT(*) FILTER (WHERE action IN ('data_exported', 'data_deleted'))::BIGINT AS export_jobs_count,
    COUNT(*) FILTER (WHERE action = 'data_deleted')::BIGINT AS delete_jobs_count
  FROM privacy_prefs
  LEFT JOIN app_allowlist ON app_allowlist.user_id = privacy_prefs.user_id
  LEFT JOIN telemetry_events ON telemetry_events.user_id = privacy_prefs.user_id
  LEFT JOIN privacy_transparency_log ON privacy_transparency_log.user_id = privacy_prefs.user_id
  WHERE privacy_prefs.monitoring_enabled = true;
$$;

GRANT EXECUTE ON FUNCTION get_privacy_health_stats() TO privacy_guardian;

-- Explicitly deny guardian role access to user rows
REVOKE ALL ON privacy_prefs FROM privacy_guardian;
REVOKE ALL ON app_allowlist FROM privacy_guardian;
REVOKE ALL ON signal_toggles FROM privacy_guardian;
REVOKE ALL ON telemetry_events FROM privacy_guardian;
REVOKE ALL ON privacy_transparency_log FROM privacy_guardian;
REVOKE ALL ON mfa_enforced_sessions FROM privacy_guardian;

-- ============================================================================
-- SECTION 10: COMMENTS
-- ============================================================================

COMMENT ON TABLE privacy_prefs IS 'Per-user privacy preferences and consent settings. Zero-trust: users can only access their own rows.';
COMMENT ON TABLE app_allowlist IS 'Per-user app allowlist for monitoring. Zero-trust: users can only access their own rows.';
COMMENT ON TABLE signal_toggles IS 'Per-user signal toggles for granular telemetry control. Zero-trust: users can only access their own rows.';
COMMENT ON TABLE telemetry_events IS 'User telemetry events, encrypted at rest. Zero-trust: users can only access their own rows. NO ADMIN ACCESS.';
COMMENT ON TABLE privacy_transparency_log IS 'Immutable append-only log of all privacy-related actions. Zero-trust: users can only access their own rows.';
COMMENT ON TABLE mfa_enforced_sessions IS 'Time-boxed elevated MFA sessions for sensitive privacy actions. Zero-trust: users can only access their own rows.';

COMMENT ON FUNCTION get_privacy_health_stats() IS 'Guardian role can only call this function to check system health. Cannot access user data rows.';
COMMENT ON FUNCTION has_elevated_mfa_session() IS 'Check if user has valid elevated MFA session for sensitive actions.';
COMMENT ON FUNCTION log_privacy_action() IS 'Immutable append-only function to log privacy actions for transparency.';
COMMENT ON FUNCTION is_privacy_kill_switch_active() IS 'Check if privacy kill-switch is active (environment-level disable).';
