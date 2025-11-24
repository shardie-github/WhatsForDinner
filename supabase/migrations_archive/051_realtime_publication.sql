-- Realtime Publication Migration
-- Creates publication for app tables to enable Supabase Realtime

-- Create publication if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

-- Add app tables to publication (only tables that should have realtime)
-- Core tables
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS users;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS households;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS household_members;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS recipes;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS meal_plans;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS grocery_lists;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS messages;

-- Growth & engagement tables
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS referral_programs;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS referral_codes;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS referrals;

-- Privacy & monitoring (if realtime needed)
-- Note: Only add if realtime updates are required for these tables
-- ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS privacy_prefs;
-- ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS telemetry_events;

-- Note: Some tables (like audit_logs, api_logs) should NOT be in realtime
-- for security/performance reasons
