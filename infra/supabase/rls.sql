-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Baseline RLS and policy templates for metrics tables
-- Timezone: America/Toronto
-- ============================================================================

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE spend ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE etl_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- EVENTS TABLE POLICIES
-- ============================================================================

-- Users can view their own events
CREATE POLICY "Users can view own events"
  ON events FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert/update/delete all events (for ETL)
CREATE POLICY "Service role can manage all events"
  ON events FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Authenticated users can insert their own events
CREATE POLICY "Users can insert own events"
  ON events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- ORDERS TABLE POLICIES
-- ============================================================================

-- Users can view their own orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage all orders (for ETL)
CREATE POLICY "Service role can manage all orders"
  ON orders FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Authenticated users can insert their own orders (for manual entry)
CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- SPEND TABLE POLICIES
-- ============================================================================

-- Service role can manage all spend (for ETL)
CREATE POLICY "Service role can manage all spend"
  ON spend FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Authenticated users with admin role can view spend
-- Note: Adjust this based on your admin role implementation
CREATE POLICY "Admins can view spend"
  ON spend FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- EXPERIMENTS TABLE POLICIES
-- ============================================================================

-- Service role can manage all experiments (for ETL/automation)
CREATE POLICY "Service role can manage all experiments"
  ON experiments FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Authenticated users can view active experiments
CREATE POLICY "Users can view active experiments"
  ON experiments FOR SELECT
  USING (status IN ('running', 'completed'));

-- Admins can manage all experiments
CREATE POLICY "Admins can manage all experiments"
  ON experiments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- METRICS_DAILY TABLE POLICIES
-- ============================================================================

-- Service role can manage all metrics (for ETL)
CREATE POLICY "Service role can manage all metrics"
  ON metrics_daily FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Authenticated users can view aggregated metrics (no PII)
CREATE POLICY "Users can view aggregated metrics"
  ON metrics_daily FOR SELECT
  USING (true); -- Aggregated metrics are safe to view

-- Admins can manage all metrics
CREATE POLICY "Admins can manage all metrics"
  ON metrics_daily FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- ETL_LOGS TABLE POLICIES
-- ============================================================================

-- Service role can manage all ETL logs (for ETL jobs)
CREATE POLICY "Service role can manage all ETL logs"
  ON etl_logs FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Admins can view ETL logs
CREATE POLICY "Admins can view ETL logs"
  ON etl_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to check if user is admin (adjust based on your implementation)
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = user_id
    AND profiles.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- NOTES
-- ============================================================================

-- 1. Service role policies assume you're using Supabase service_role key for ETL
-- 2. Admin role check assumes a 'profiles' table with a 'role' column
--    Adjust the admin check based on your actual implementation
-- 3. For production, consider:
--    - More granular permissions (e.g., read-only service accounts)
--    - Audit logging for sensitive operations
--    - Rate limiting on inserts
--    - Data retention policies
