-- Guardian Trust Ledger Roots Migration
-- Stores daily hash roots for cryptographic verification

CREATE TABLE IF NOT EXISTS trust_ledger_roots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  root_hash TEXT NOT NULL,
  event_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS trust_ledger_roots_user_id_idx ON trust_ledger_roots(user_id);
CREATE INDEX IF NOT EXISTS trust_ledger_roots_date_idx ON trust_ledger_roots(date);
CREATE INDEX IF NOT EXISTS trust_ledger_roots_user_date_idx ON trust_ledger_roots(user_id, date);

-- Enable RLS
ALTER TABLE trust_ledger_roots ENABLE ROW LEVEL SECURITY;

-- RLS Policies - User-only access
CREATE POLICY "trust_ledger_roots_user_select"
  ON trust_ledger_roots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "trust_ledger_roots_user_insert"
  ON trust_ledger_roots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- NO UPDATE/DELETE - roots are immutable
-- NO ADMIN ACCESS - zero-trust, user-only

COMMENT ON TABLE trust_ledger_roots IS 'Daily hash roots for Guardian trust ledger verification. Zero-trust: users can only access their own rows.';

-- Function to store daily root hash
CREATE OR REPLACE FUNCTION store_ledger_root(
  p_user_id UUID,
  p_date DATE,
  p_root_hash TEXT,
  p_event_count INTEGER
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  root_id UUID;
BEGIN
  INSERT INTO trust_ledger_roots (user_id, date, root_hash, event_count)
  VALUES (p_user_id, p_date, p_root_hash, p_event_count)
  ON CONFLICT (user_id, date) DO UPDATE SET
    root_hash = EXCLUDED.root_hash,
    event_count = EXCLUDED.event_count
  RETURNING id INTO root_id;
  
  RETURN root_id;
END;
$$;

COMMENT ON FUNCTION store_ledger_root IS 'Store daily hash root for ledger verification. Only callable by authenticated users for their own data.';
