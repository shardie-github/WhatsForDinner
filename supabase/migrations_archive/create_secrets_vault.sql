-- Create secrets_vault table for storing encrypted secrets
-- This table is used by the unified secrets management system

CREATE TABLE IF NOT EXISTS secrets_vault (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  environment TEXT NOT NULL DEFAULT 'production',
  last_rotated TIMESTAMPTZ DEFAULT NOW(),
  next_rotation TIMESTAMPTZ,
  hash TEXT,
  encrypted BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(key, environment)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_secrets_vault_key_env ON secrets_vault(key, environment);
CREATE INDEX IF NOT EXISTS idx_secrets_vault_next_rotation ON secrets_vault(next_rotation);
CREATE INDEX IF NOT EXISTS idx_secrets_vault_environment ON secrets_vault(environment);

-- Enable RLS
ALTER TABLE secrets_vault ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can access secrets
DROP POLICY IF EXISTS "Service role only" ON secrets_vault;
CREATE POLICY "Service role only" ON secrets_vault
  FOR ALL
  USING (auth.role() = 'service_role');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_secrets_vault_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_secrets_vault_updated_at ON secrets_vault;
CREATE TRIGGER update_secrets_vault_updated_at
  BEFORE UPDATE ON secrets_vault
  FOR EACH ROW
  EXECUTE FUNCTION update_secrets_vault_updated_at();

-- Create secret_rotation_logs table for audit trail
CREATE TABLE IF NOT EXISTS secret_rotation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL,
  environment TEXT NOT NULL,
  new_hash TEXT,
  rotated_at TIMESTAMPTZ DEFAULT NOW(),
  rotated_by TEXT DEFAULT 'system'
);

CREATE INDEX IF NOT EXISTS idx_secret_rotation_logs_key ON secret_rotation_logs(key, environment);
CREATE INDEX IF NOT EXISTS idx_secret_rotation_logs_rotated_at ON secret_rotation_logs(rotated_at);

-- Enable RLS on rotation logs
ALTER TABLE secret_rotation_logs ENABLE ROW LEVEL SECURITY;

-- Policy for rotation logs
DROP POLICY IF EXISTS "Service role only" ON secret_rotation_logs;
CREATE POLICY "Service role only" ON secret_rotation_logs
  FOR ALL
  USING (auth.role() = 'service_role');

-- Grant necessary permissions
GRANT ALL ON secrets_vault TO service_role;
GRANT ALL ON secret_rotation_logs TO service_role;

-- Add comments for documentation
COMMENT ON TABLE secrets_vault IS 'Centralized secrets vault for storing encrypted environment variables and API keys';
COMMENT ON COLUMN secrets_vault.key IS 'Environment variable key name';
COMMENT ON COLUMN secrets_vault.value IS 'Encrypted secret value';
COMMENT ON COLUMN secrets_vault.environment IS 'Environment: production, staging, development, preview';
COMMENT ON COLUMN secrets_vault.encrypted IS 'Whether the value is encrypted';
COMMENT ON COLUMN secrets_vault.next_rotation IS 'Next scheduled rotation date';

COMMENT ON TABLE secret_rotation_logs IS 'Audit log for secret rotations';
COMMENT ON COLUMN secret_rotation_logs.new_hash IS 'SHA256 hash of the new secret value';
