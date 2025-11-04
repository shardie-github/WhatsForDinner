-- Guardian Trust Ledger Roots Table
-- Stores daily hash roots for cryptographic verification

CREATE TABLE IF NOT EXISTS trust_ledger_roots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  hash_root text NOT NULL,
  event_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS trust_ledger_roots_user_id_idx ON trust_ledger_roots(user_id);
CREATE INDEX IF NOT EXISTS trust_ledger_roots_date_idx ON trust_ledger_roots(date);

-- RLS: Users can only access their own ledger roots
ALTER TABLE trust_ledger_roots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trust_ledger_roots_user_select"
  ON trust_ledger_roots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "trust_ledger_roots_user_insert"
  ON trust_ledger_roots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can only see aggregate counts (no individual access)
CREATE POLICY "trust_ledger_roots_admin_aggregate"
  ON trust_ledger_roots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
    AND false -- Never allow admin to see individual roots
  );

COMMENT ON TABLE trust_ledger_roots IS 'Daily hash roots for Guardian trust ledger verification. Zero-trust: users can only access their own roots.';
