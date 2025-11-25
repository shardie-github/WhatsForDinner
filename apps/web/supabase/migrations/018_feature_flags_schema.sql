-- Feature Flags and Kill Switches Schema
-- This migration creates the feature flags system with RLS for safe configuration

-- Create config_flags table for feature flags and kill switches
CREATE TABLE IF NOT EXISTS config_flags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  enabled BOOLEAN NOT NULL DEFAULT false,
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  target_environment TEXT DEFAULT 'all' CHECK (target_environment IN ('all', 'development', 'staging', 'production')),
  target_users TEXT[] DEFAULT '{}', -- Array of user IDs for targeted rollouts
  conditions JSONB DEFAULT '{}', -- Additional conditions for flag evaluation
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create index for efficient flag lookups
CREATE INDEX IF NOT EXISTS idx_config_flags_enabled ON config_flags(enabled);
CREATE INDEX IF NOT EXISTS idx_config_flags_environment ON config_flags(target_environment);
CREATE INDEX IF NOT EXISTS idx_config_flags_expires ON config_flags(expires_at);

-- Create flag_audit_log for tracking flag changes
CREATE TABLE IF NOT EXISTS flag_audit_log (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  flag_id TEXT REFERENCES config_flags(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'enabled', 'disabled', 'deleted')),
  old_values JSONB,
  new_values JSONB,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reason TEXT
);

-- Create index for audit log queries
CREATE INDEX IF NOT EXISTS idx_flag_audit_log_flag_id ON flag_audit_log(flag_id);
CREATE INDEX IF NOT EXISTS idx_flag_audit_log_changed_at ON flag_audit_log(changed_at);

-- Enable RLS on both tables
ALTER TABLE config_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE flag_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for config_flags
-- Anonymous users can only read enabled flags (for client-side evaluation)
CREATE POLICY "Anonymous users can read enabled flags" ON config_flags
  FOR SELECT USING (enabled = true AND (expires_at IS NULL OR expires_at > NOW()));

-- Authenticated users can read all flags (for admin interfaces)
CREATE POLICY "Authenticated users can read all flags" ON config_flags
  FOR SELECT USING (auth.role() = 'authenticated');

-- Service role can do everything (for server-side operations)
CREATE POLICY "Service role can manage flags" ON config_flags
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for flag_audit_log
-- Only service role can write to audit log
CREATE POLICY "Service role can write audit log" ON flag_audit_log
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Authenticated users can read audit log
CREATE POLICY "Authenticated users can read audit log" ON flag_audit_log
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_config_flags_updated_at
  BEFORE UPDATE ON config_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to log flag changes
CREATE OR REPLACE FUNCTION log_flag_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO flag_audit_log (flag_id, action, new_values, changed_by, reason)
    VALUES (NEW.id, 'created', to_jsonb(NEW), NEW.created_by, 'Flag created');
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO flag_audit_log (flag_id, action, old_values, new_values, changed_by, reason)
    VALUES (NEW.id, 'updated', to_jsonb(OLD), to_jsonb(NEW), NEW.created_by, 'Flag updated');
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO flag_audit_log (flag_id, action, old_values, changed_by, reason)
    VALUES (OLD.id, 'deleted', to_jsonb(OLD), OLD.created_by, 'Flag deleted');
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Create trigger for flag change logging
CREATE TRIGGER log_config_flags_changes
  AFTER INSERT OR UPDATE OR DELETE ON config_flags
  FOR EACH ROW
  EXECUTE FUNCTION log_flag_change();

-- Insert default feature flags
INSERT INTO config_flags (id, name, description, enabled, target_environment, created_by) VALUES
  ('maintenance_mode', 'Maintenance Mode', 'Enable maintenance mode to show downtime page', false, 'all', (SELECT id FROM auth.users LIMIT 1)),
  ('new_ui_enabled', 'New UI Enabled', 'Enable the new user interface', false, 'production', (SELECT id FROM auth.users LIMIT 1)),
  ('beta_features', 'Beta Features', 'Enable beta features for testing', true, 'staging', (SELECT id FROM auth.users LIMIT 1)),
  ('analytics_enabled', 'Analytics Enabled', 'Enable user analytics tracking', true, 'all', (SELECT id FROM auth.users LIMIT 1)),
  ('debug_mode', 'Debug Mode', 'Enable debug logging and additional error details', false, 'development', (SELECT id FROM auth.users LIMIT 1))
ON CONFLICT (id) DO NOTHING;

-- Create function to evaluate feature flags for a user
CREATE OR REPLACE FUNCTION evaluate_feature_flag(
  flag_name TEXT,
  user_id UUID DEFAULT NULL,
  environment TEXT DEFAULT 'production'
)
RETURNS BOOLEAN AS $$
DECLARE
  flag_record RECORD;
  user_hash INTEGER;
  target_percentage INTEGER;
BEGIN
  -- Get the flag configuration
  SELECT * INTO flag_record
  FROM config_flags
  WHERE name = flag_name
    AND enabled = true
    AND (target_environment = 'all' OR target_environment = environment)
    AND (expires_at IS NULL OR expires_at > NOW());

  -- If flag doesn't exist or is disabled, return false
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- If rollout_percentage is 0, return false
  IF flag_record.rollout_percentage = 0 THEN
    RETURN false;
  END IF;

  -- If rollout_percentage is 100, return true
  IF flag_record.rollout_percentage = 100 THEN
    RETURN true;
  END IF;

  -- If user_id is provided, check targeted users
  IF user_id IS NOT NULL AND array_length(flag_record.target_users, 1) > 0 THEN
    IF user_id = ANY(flag_record.target_users) THEN
      RETURN true;
    END IF;
  END IF;

  -- If user_id is provided, use consistent hashing for percentage-based rollouts
  IF user_id IS NOT NULL THEN
    -- Create a consistent hash of user_id + flag_name
    user_hash := ('x' || substr(md5(user_id::text || flag_name), 1, 8))::bit(32)::int;
    target_percentage := user_hash % 100;
    
    RETURN target_percentage < flag_record.rollout_percentage;
  END IF;

  -- If no user_id, return false for percentage-based rollouts
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION evaluate_feature_flag(TEXT, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION evaluate_feature_flag(TEXT, UUID, TEXT) TO anon;

-- Create function to get all active flags for a user (for client-side caching)
CREATE OR REPLACE FUNCTION get_user_feature_flags(
  user_id UUID DEFAULT NULL,
  environment TEXT DEFAULT 'production'
)
RETURNS TABLE(flag_name TEXT, enabled BOOLEAN) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cf.name as flag_name,
    evaluate_feature_flag(cf.name, user_id, environment) as enabled
  FROM config_flags cf
  WHERE cf.enabled = true
    AND (cf.target_environment = 'all' OR cf.target_environment = environment)
    AND (cf.expires_at IS NULL OR cf.expires_at > NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_feature_flags(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_feature_flags(UUID, TEXT) TO anon;
