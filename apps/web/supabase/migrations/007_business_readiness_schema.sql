-- Business Readiness System Schema Migration
-- This migration creates all tables required for business readiness, CRO, monetization, 
-- autonomous infrastructure, and self-learning systems

-- ============================================================================
-- BUSINESS READINESS TABLES
-- ============================================================================

-- Business readiness reports table
CREATE TABLE IF NOT EXISTS business_readiness_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  categories JSONB NOT NULL DEFAULT '{}',
  recommendations TEXT[] DEFAULT '{}',
  next_review_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- CRO (CONVERSION RATE OPTIMIZATION) TABLES
-- ============================================================================

-- CTA placements table for tracking call-to-action buttons and their performance
CREATE TABLE IF NOT EXISTS cta_placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  page TEXT NOT NULL,
  section TEXT NOT NULL,
  position TEXT NOT NULL CHECK (position IN ('above_fold', 'below_fold', 'sidebar', 'modal', 'inline')),
  variant TEXT NOT NULL,
  text TEXT NOT NULL,
  style JSONB NOT NULL DEFAULT '{}',
  performance JSONB NOT NULL DEFAULT '{
    "impressions": 0,
    "clicks": 0,
    "conversions": 0,
    "ctr": 0,
    "conversion_rate": 0,
    "revenue": 0,
    "rpc": 0
  }',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CTA interactions table for detailed event tracking
CREATE TABLE IF NOT EXISTS cta_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cta_placement_id UUID REFERENCES cta_placements(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('impression', 'click', 'conversion')),
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- MONETIZATION TABLES
-- ============================================================================

-- Tenant usage summary table (materialized view-like table for fast queries)
CREATE TABLE IF NOT EXISTS tenant_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE UNIQUE NOT NULL,
  total_meals_today INTEGER DEFAULT 0,
  total_meals_this_month INTEGER DEFAULT 0,
  total_tokens_today BIGINT DEFAULT 0,
  total_tokens_this_month BIGINT DEFAULT 0,
  total_cost_today NUMERIC(10, 4) DEFAULT 0,
  total_cost_this_month NUMERIC(10, 4) DEFAULT 0,
  plan_quota INTEGER NOT NULL,
  remaining_quota INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Marketplace items table for premium recipe packs and meal plans
CREATE TABLE IF NOT EXISTS marketplace_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  item_type TEXT NOT NULL CHECK (item_type IN ('recipe_pack', 'meal_plan', 'feature', 'addon')),
  price_usd NUMERIC(10, 2) NOT NULL,
  stripe_price_id TEXT,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Affiliate conversions table for tracking affiliate program performance
CREATE TABLE IF NOT EXISTS affiliate_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referral_code TEXT,
  conversion_type TEXT NOT NULL CHECK (conversion_type IN ('signup', 'subscription', 'purchase')),
  revenue_usd NUMERIC(10, 2) NOT NULL,
  commission_usd NUMERIC(10, 2) DEFAULT 0,
  commission_rate NUMERIC(5, 4) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
  converted_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  converted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enterprise quotes table for B2B sales pipeline
CREATE TABLE IF NOT EXISTS enterprise_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_name TEXT,
  company_size TEXT CHECK (company_size IN ('startup', 'small', 'medium', 'large', 'enterprise')),
  estimated_seats INTEGER,
  quote_amount_usd NUMERIC(10, 2),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'negotiating', 'accepted', 'rejected', 'expired')),
  sales_rep_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data licenses table for selling aggregated insights
CREATE TABLE IF NOT EXISTS data_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  licensee_name TEXT NOT NULL,
  licensee_email TEXT NOT NULL,
  license_type TEXT NOT NULL CHECK (license_type IN ('insights', 'trends', 'raw_data', 'custom')),
  data_scope JSONB NOT NULL DEFAULT '{}',
  price_usd NUMERIC(10, 2) NOT NULL,
  duration_months INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'revoked')),
  starts_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Revenue records table for comprehensive revenue tracking
CREATE TABLE IF NOT EXISTS revenue_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  revenue_type TEXT NOT NULL CHECK (revenue_type IN ('subscription', 'usage_credits', 'marketplace', 'affiliate', 'enterprise', 'data_license', 'one_time')),
  amount_usd NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  stripe_transaction_id TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- AUTONOMOUS INFRASTRUCTURE TABLES
-- ============================================================================

-- Error logs table for infrastructure error tracking
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type TEXT NOT NULL,
  message TEXT NOT NULL,
  stack_trace TEXT,
  component TEXT,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance logs table for infrastructure performance tracking
CREATE TABLE IF NOT EXISTS performance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT,
  method TEXT,
  response_time INTEGER NOT NULL, -- in milliseconds
  status_code INTEGER,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Infrastructure health snapshots table
CREATE TABLE IF NOT EXISTS infrastructure_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL CHECK (status IN ('healthy', 'degraded', 'critical')),
  metrics JSONB NOT NULL DEFAULT '{}',
  issues JSONB DEFAULT '[]',
  last_check TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Self-healing actions log table
CREATE TABLE IF NOT EXISTS self_healing_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id TEXT NOT NULL UNIQUE,
  issue_id TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('restart', 'scale', 'cache_clear', 'db_optimize', 'rollback')),
  executed BOOLEAN DEFAULT false,
  success BOOLEAN,
  execution_time INTEGER, -- in milliseconds
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  executed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- SELF-LEARNING SYSTEM TABLES
-- ============================================================================

-- Learning insights table for storing insights from learning cycles
CREATE TABLE IF NOT EXISTS learning_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_type TEXT NOT NULL CHECK (insight_type IN ('conversion', 'performance', 'monetization', 'ux', 'infrastructure')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  impact_score NUMERIC(3, 2) NOT NULL CHECK (impact_score >= 0 AND impact_score <= 10),
  confidence NUMERIC(3, 2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  data_sources JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  automated_action_taken BOOLEAN DEFAULT false,
  action_result JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning cycles table for tracking learning cycle results
CREATE TABLE IF NOT EXISTS learning_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_start TIMESTAMP WITH TIME ZONE NOT NULL,
  cycle_end TIMESTAMP WITH TIME ZONE NOT NULL,
  insights_generated INTEGER DEFAULT 0,
  insights_prioritized INTEGER DEFAULT 0,
  actions_taken INTEGER DEFAULT 0,
  improvements_measured JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Business readiness indexes
CREATE INDEX IF NOT EXISTS idx_business_readiness_reports_tenant_id ON business_readiness_reports(tenant_id);
CREATE INDEX IF NOT EXISTS idx_business_readiness_reports_timestamp ON business_readiness_reports(timestamp);
CREATE INDEX IF NOT EXISTS idx_business_readiness_reports_score ON business_readiness_reports(overall_score);

-- CRO indexes
CREATE INDEX IF NOT EXISTS idx_cta_placements_tenant_id ON cta_placements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_cta_placements_page ON cta_placements(page);
CREATE INDEX IF NOT EXISTS idx_cta_placements_active ON cta_placements(is_active);
CREATE INDEX IF NOT EXISTS idx_cta_interactions_placement_id ON cta_interactions(cta_placement_id);
CREATE INDEX IF NOT EXISTS idx_cta_interactions_user_id ON cta_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_cta_interactions_session_id ON cta_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_cta_interactions_event_type ON cta_interactions(event_type);
CREATE INDEX IF NOT EXISTS idx_cta_interactions_timestamp ON cta_interactions(timestamp);

-- Monetization indexes
CREATE INDEX IF NOT EXISTS idx_tenant_usage_tenant_id ON tenant_usage(tenant_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_type ON marketplace_items(item_type);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_active ON marketplace_items(is_active);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_affiliate_id ON affiliate_conversions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_referral_code ON affiliate_conversions(referral_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_status ON affiliate_conversions(status);
CREATE INDEX IF NOT EXISTS idx_enterprise_quotes_status ON enterprise_quotes(status);
CREATE INDEX IF NOT EXISTS idx_enterprise_quotes_sales_rep_id ON enterprise_quotes(sales_rep_id);
CREATE INDEX IF NOT EXISTS idx_data_licenses_status ON data_licenses(status);
CREATE INDEX IF NOT EXISTS idx_revenue_records_tenant_id ON revenue_records(tenant_id);
CREATE INDEX IF NOT EXISTS idx_revenue_records_user_id ON revenue_records(user_id);
CREATE INDEX IF NOT EXISTS idx_revenue_records_type ON revenue_records(revenue_type);
CREATE INDEX IF NOT EXISTS idx_revenue_records_recorded_at ON revenue_records(recorded_at);

-- Infrastructure indexes
CREATE INDEX IF NOT EXISTS idx_error_logs_timestamp ON error_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON error_logs(resolved);
CREATE INDEX IF NOT EXISTS idx_error_logs_tenant_id ON error_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_performance_logs_timestamp ON performance_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_logs_endpoint ON performance_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_performance_logs_tenant_id ON performance_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_infrastructure_health_status ON infrastructure_health(status);
CREATE INDEX IF NOT EXISTS idx_infrastructure_health_last_check ON infrastructure_health(last_check);
CREATE INDEX IF NOT EXISTS idx_self_healing_actions_issue_id ON self_healing_actions(issue_id);
CREATE INDEX IF NOT EXISTS idx_self_healing_actions_type ON self_healing_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_self_healing_actions_executed ON self_healing_actions(executed);

-- Learning system indexes
CREATE INDEX IF NOT EXISTS idx_learning_insights_type ON learning_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_learning_insights_impact_score ON learning_insights(impact_score);
CREATE INDEX IF NOT EXISTS idx_learning_insights_confidence ON learning_insights(confidence);
CREATE INDEX IF NOT EXISTS idx_learning_insights_created_at ON learning_insights(created_at);
CREATE INDEX IF NOT EXISTS idx_learning_cycles_start ON learning_cycles(cycle_start);
CREATE INDEX IF NOT EXISTS idx_learning_cycles_end ON learning_cycles(cycle_end);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE business_readiness_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE cta_placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE cta_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE infrastructure_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE self_healing_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_cycles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Business readiness reports policies
CREATE POLICY "Users can view business readiness reports for their tenants"
  ON business_readiness_reports FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_memberships 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage business readiness reports"
  ON business_readiness_reports FOR ALL
  USING (true);

-- CTA placements policies
CREATE POLICY "Users can view CTAs for their tenants"
  ON cta_placements FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_memberships 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage CTAs"
  ON cta_placements FOR ALL
  USING (true);

-- CTA interactions policies
CREATE POLICY "Users can view their own CTA interactions"
  ON cta_interactions FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "System can insert CTA interactions"
  ON cta_interactions FOR INSERT
  WITH CHECK (true);

-- Tenant usage policies
CREATE POLICY "Users can view usage for their tenants"
  ON tenant_usage FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_memberships 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage tenant usage"
  ON tenant_usage FOR ALL
  USING (true);

-- Marketplace items policies (public read, admin write)
CREATE POLICY "Anyone can view active marketplace items"
  ON marketplace_items FOR SELECT
  USING (is_active = true);

CREATE POLICY "System can manage marketplace items"
  ON marketplace_items FOR ALL
  USING (true);

-- Affiliate conversions policies
CREATE POLICY "Users can view their own affiliate conversions"
  ON affiliate_conversions FOR SELECT
  USING (affiliate_id = auth.uid());

CREATE POLICY "System can manage affiliate conversions"
  ON affiliate_conversions FOR ALL
  USING (true);

-- Enterprise quotes policies
CREATE POLICY "Users can view quotes they created or are assigned to"
  ON enterprise_quotes FOR SELECT
  USING (
    contact_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR sales_rep_id = auth.uid()
  );

CREATE POLICY "System can manage enterprise quotes"
  ON enterprise_quotes FOR ALL
  USING (true);

-- Data licenses policies
CREATE POLICY "Users can view licenses where they are the licensee"
  ON data_licenses FOR SELECT
  USING (
    licensee_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "System can manage data licenses"
  ON data_licenses FOR ALL
  USING (true);

-- Revenue records policies
CREATE POLICY "Users can view revenue for their tenants"
  ON revenue_records FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_memberships 
      WHERE user_id = auth.uid()
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "System can manage revenue records"
  ON revenue_records FOR ALL
  USING (true);

-- Error logs policies
CREATE POLICY "Users can view their own error logs"
  ON error_logs FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "System can manage error logs"
  ON error_logs FOR ALL
  USING (true);

-- Performance logs policies
CREATE POLICY "Users can view their own performance logs"
  ON performance_logs FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "System can manage performance logs"
  ON performance_logs FOR ALL
  USING (true);

-- Infrastructure health policies
CREATE POLICY "Authenticated users can view infrastructure health"
  ON infrastructure_health FOR SELECT
  USING (true);

CREATE POLICY "System can manage infrastructure health"
  ON infrastructure_health FOR ALL
  USING (true);

-- Self-healing actions policies
CREATE POLICY "Authenticated users can view self-healing actions"
  ON self_healing_actions FOR SELECT
  USING (true);

CREATE POLICY "System can manage self-healing actions"
  ON self_healing_actions FOR ALL
  USING (true);

-- Learning insights policies
CREATE POLICY "Authenticated users can view learning insights"
  ON learning_insights FOR SELECT
  USING (true);

CREATE POLICY "System can manage learning insights"
  ON learning_insights FOR ALL
  USING (true);

-- Learning cycles policies
CREATE POLICY "Authenticated users can view learning cycles"
  ON learning_cycles FOR SELECT
  USING (true);

CREATE POLICY "System can manage learning cycles"
  ON learning_cycles FOR ALL
  USING (true);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to update tenant_usage from usage_logs (can be called periodically)
CREATE OR REPLACE FUNCTION update_tenant_usage(tenant_id_param UUID)
RETURNS void AS $$
DECLARE
  tenant_plan TEXT;
  quota_limit INTEGER;
  usage_summary RECORD;
BEGIN
  -- Get tenant plan
  SELECT plan INTO tenant_plan FROM tenants WHERE id = tenant_id_param;
  
  -- Set quota based on plan
  CASE tenant_plan
    WHEN 'free' THEN quota_limit := 3;
    WHEN 'pro' THEN quota_limit := 1000;
    WHEN 'family' THEN quota_limit := 1000;
    ELSE quota_limit := 0;
  END CASE;
  
  -- Get usage summary
  SELECT 
    COUNT(*) FILTER (WHERE action = 'meal_generation' AND timestamp >= CURRENT_DATE) AS meals_today,
    COUNT(*) FILTER (WHERE action = 'meal_generation' AND timestamp >= DATE_TRUNC('month', CURRENT_DATE)) AS meals_month,
    COALESCE(SUM(tokens_used) FILTER (WHERE timestamp >= CURRENT_DATE), 0) AS tokens_today,
    COALESCE(SUM(tokens_used) FILTER (WHERE timestamp >= DATE_TRUNC('month', CURRENT_DATE)), 0) AS tokens_month,
    COALESCE(SUM(cost_usd) FILTER (WHERE timestamp >= CURRENT_DATE), 0) AS cost_today,
    COALESCE(SUM(cost_usd) FILTER (WHERE timestamp >= DATE_TRUNC('month', CURRENT_DATE)), 0) AS cost_month
  INTO usage_summary
  FROM usage_logs
  WHERE tenant_id = tenant_id_param;
  
  -- Upsert tenant_usage
  INSERT INTO tenant_usage (
    tenant_id,
    total_meals_today,
    total_meals_this_month,
    total_tokens_today,
    total_tokens_this_month,
    total_cost_today,
    total_cost_this_month,
    plan_quota,
    remaining_quota,
    last_updated
  ) VALUES (
    tenant_id_param,
    COALESCE(usage_summary.meals_today, 0),
    COALESCE(usage_summary.meals_month, 0),
    COALESCE(usage_summary.tokens_today, 0),
    COALESCE(usage_summary.tokens_month, 0),
    COALESCE(usage_summary.cost_today, 0),
    COALESCE(usage_summary.cost_month, 0),
    quota_limit,
    GREATEST(quota_limit - COALESCE(usage_summary.meals_today, 0), 0),
    NOW()
  )
  ON CONFLICT (tenant_id) DO UPDATE SET
    total_meals_today = EXCLUDED.total_meals_today,
    total_meals_this_month = EXCLUDED.total_meals_this_month,
    total_tokens_today = EXCLUDED.total_tokens_today,
    total_tokens_this_month = EXCLUDED.total_tokens_this_month,
    total_cost_today = EXCLUDED.total_cost_today,
    total_cost_this_month = EXCLUDED.total_cost_this_month,
    plan_quota = EXCLUDED.plan_quota,
    remaining_quota = EXCLUDED.remaining_quota,
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get tenant usage (wrapper around tenant_usage table)
CREATE OR REPLACE FUNCTION get_tenant_usage_data(tenant_id_param UUID)
RETURNS TABLE (
  total_meals_today INTEGER,
  total_meals_this_month INTEGER,
  total_tokens_today BIGINT,
  total_tokens_this_month BIGINT,
  total_cost_today NUMERIC,
  total_cost_this_month NUMERIC,
  plan_quota INTEGER,
  remaining_quota INTEGER
) AS $$
BEGIN
  -- Update usage first
  PERFORM update_tenant_usage(tenant_id_param);
  
  -- Return current usage
  RETURN QUERY
  SELECT 
    tu.total_meals_today,
    tu.total_meals_this_month,
    tu.total_tokens_today,
    tu.total_tokens_this_month,
    tu.total_cost_today,
    tu.total_cost_this_month,
    tu.plan_quota,
    tu.remaining_quota
  FROM tenant_usage tu
  WHERE tu.tenant_id = tenant_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at timestamp on cta_placements
CREATE OR REPLACE FUNCTION update_cta_placements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cta_placements_updated_at
  BEFORE UPDATE ON cta_placements
  FOR EACH ROW
  EXECUTE FUNCTION update_cta_placements_updated_at();

-- Trigger to update updated_at timestamp on marketplace_items
CREATE TRIGGER update_marketplace_items_updated_at
  BEFORE UPDATE ON marketplace_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at timestamp on enterprise_quotes
CREATE TRIGGER update_enterprise_quotes_updated_at
  BEFORE UPDATE ON enterprise_quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at timestamp on data_licenses
CREATE TRIGGER update_data_licenses_updated_at
  BEFORE UPDATE ON data_licenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON business_readiness_reports TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON business_readiness_reports TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON cta_placements TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON cta_placements TO service_role;
GRANT SELECT, INSERT ON cta_interactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON cta_interactions TO service_role;
GRANT SELECT ON tenant_usage TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON tenant_usage TO service_role;
GRANT SELECT ON marketplace_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON marketplace_items TO service_role;
GRANT SELECT ON affiliate_conversions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON affiliate_conversions TO service_role;
GRANT SELECT ON enterprise_quotes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON enterprise_quotes TO service_role;
GRANT SELECT ON data_licenses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON data_licenses TO service_role;
GRANT SELECT ON revenue_records TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON revenue_records TO service_role;
GRANT SELECT ON error_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON error_logs TO service_role;
GRANT SELECT ON performance_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON performance_logs TO service_role;
GRANT SELECT ON infrastructure_health TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON infrastructure_health TO service_role;
GRANT SELECT ON self_healing_actions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON self_healing_actions TO service_role;
GRANT SELECT ON learning_insights TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON learning_insights TO service_role;
GRANT SELECT ON learning_cycles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON learning_cycles TO service_role;

GRANT EXECUTE ON FUNCTION update_tenant_usage(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION get_tenant_usage_data(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_tenant_usage_data(UUID) TO service_role;
