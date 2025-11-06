-- ============================================================================
-- ACCOUNT DELETION FUNCTION
-- Secure account deletion with data retention for legal compliance
-- ============================================================================

-- Function to delete user account and anonymize data
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void AS $$
DECLARE
  user_uuid uuid;
BEGIN
  user_uuid := auth.uid();
  
  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Soft delete: Mark data for deletion instead of hard delete
  -- This allows for legal retention requirements
  
  -- Anonymize user data
  UPDATE profiles
  SET 
    name = 'Deleted User',
    preferences = '{}'::jsonb,
    updated_at = now()
  WHERE id = user_uuid;

  -- Delete user-specific data (soft delete to anonymized)
  UPDATE pantry_items
  SET 
    ingredient = 'Deleted',
    quantity = 0,
    updated_at = now()
  WHERE user_id = user_uuid;

  -- Delete meal plans (soft delete)
  UPDATE meal_plans
  SET 
    name = 'Deleted Plan',
    metadata = '{"deleted": true}'::jsonb,
    updated_at = now()
  WHERE user_id = user_uuid;

  -- Delete recipes (soft delete)
  UPDATE recipes
  SET 
    title = 'Deleted Recipe',
    details = '{}'::jsonb,
    updated_at = now()
  WHERE user_id = user_uuid;

  -- Cancel subscriptions
  UPDATE subscriptions
  SET 
    status = 'canceled',
    cancel_at_period_end = false,
    updated_at = now()
  WHERE user_id = user_uuid;

  -- Delete auth user (Supabase handles this)
  -- Note: This should be done via Supabase Auth API, not SQL
  -- The function above prepares the data for deletion

  -- Log deletion
  INSERT INTO account_deletions (
    user_id,
    deleted_at,
    reason
  )
  VALUES (
    user_uuid,
    now(),
    'User requested deletion'
  );

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Account deletions log table
CREATE TABLE IF NOT EXISTS account_deletions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  deleted_at timestamptz default now(),
  reason text,
  data_retention_until timestamptz, -- Legal retention period
  metadata jsonb default '{}'
);

CREATE INDEX IF NOT EXISTS idx_account_deletions_user ON account_deletions(user_id);
CREATE INDEX IF NOT EXISTS idx_account_deletions_date ON account_deletions(deleted_at);

-- RLS for account deletions
ALTER TABLE account_deletions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view deletions"
  ON account_deletions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
