-- Metrics Calculation Functions
-- Migration: 016_metrics_calculations.sql
-- 
-- Creates functions for calculating key YC metrics:
-- - DAU/WAU/MAU
-- - Activation rate
-- - Retention rate
-- - Conversion funnel
-- - MRR/ARPU
-- - Unit economics

-- ============================================================================
-- SECTION 1: ACTIVE USERS (DAU/WAU/MAU)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_active_users(
  period_start TIMESTAMPTZ DEFAULT CURRENT_DATE - INTERVAL '30 days',
  period_end TIMESTAMPTZ DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  date DATE,
  dau BIGINT,
  wau BIGINT,
  mau BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    date_trunc('day', timestamp)::DATE as date,
    COUNT(DISTINCT user_id) FILTER (
      WHERE timestamp >= date_trunc('day', CURRENT_DATE)
    ) as dau,
    COUNT(DISTINCT user_id) FILTER (
      WHERE timestamp >= CURRENT_DATE - INTERVAL '7 days'
    ) as wau,
    COUNT(DISTINCT user_id) FILTER (
      WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days'
    ) as mau
  FROM analytics_events
  WHERE timestamp BETWEEN period_start AND period_end
    AND user_id IS NOT NULL
  GROUP BY date_trunc('day', timestamp)::DATE
  ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SECTION 2: ACTIVATION RATE
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_activation_rate(
  days_after_signup INT DEFAULT 7
)
RETURNS TABLE (
  total_signups BIGINT,
  activated_users BIGINT,
  activation_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH signups AS (
    SELECT DISTINCT user_id, MIN(timestamp) as signup_date
    FROM analytics_events
    WHERE event_type = 'user_signed_up'
    GROUP BY user_id
  ),
  activated AS (
    SELECT DISTINCT s.user_id
    FROM signups s
    INNER JOIN recipe_metrics rm ON rm.user_id = s.user_id
    WHERE rm.generated_at <= s.signup_date + (days_after_signup || ' days')::INTERVAL
  )
  SELECT 
    COUNT(*) as total_signups,
    (SELECT COUNT(*) FROM activated) as activated_users,
    ROUND(
      (SELECT COUNT(*)::NUMERIC FROM activated) / 
      NULLIF(COUNT(*), 0) * 100, 
      2
    ) as activation_rate
  FROM signups;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SECTION 3: RETENTION RATE
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_retention(
  cohort_start DATE,
  days_after_signup INT
)
RETURNS TABLE (
  cohort_date DATE,
  signups BIGINT,
  retained BIGINT,
  retention_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH cohort_users AS (
    SELECT DISTINCT user_id
    FROM analytics_events
    WHERE event_type = 'user_signed_up'
      AND DATE(timestamp) = cohort_start
  ),
  retained_users AS (
    SELECT DISTINCT user_id
    FROM analytics_events
    WHERE user_id IN (SELECT user_id FROM cohort_users)
      AND timestamp >= cohort_start + (days_after_signup || ' days')::INTERVAL
      AND timestamp < cohort_start + ((days_after_signup + 1) || ' days')::INTERVAL
  )
  SELECT 
    cohort_start as cohort_date,
    COUNT(*) as signups,
    (SELECT COUNT(*) FROM retained_users) as retained,
    ROUND(
      (SELECT COUNT(*)::NUMERIC FROM retained_users) / 
      NULLIF(COUNT(*), 0) * 100, 
      2
    ) as retention_rate
  FROM cohort_users;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SECTION 4: CONVERSION FUNNEL
-- ============================================================================

CREATE OR REPLACE FUNCTION get_conversion_funnel(
  period_start TIMESTAMPTZ DEFAULT CURRENT_DATE - INTERVAL '30 days',
  period_end TIMESTAMPTZ DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  visitors BIGINT,
  signups BIGINT,
  signup_rate NUMERIC,
  activated BIGINT,
  activation_rate NUMERIC,
  engaged BIGINT,
  engagement_rate NUMERIC,
  paying BIGINT,
  conversion_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH funnel_data AS (
    SELECT 
      COUNT(DISTINCT CASE WHEN event_type = 'page_view' THEN session_id END) as visitors,
      COUNT(DISTINCT CASE WHEN event_type = 'user_signed_up' THEN user_id END) as signups,
      COUNT(DISTINCT CASE WHEN event_type = 'recipe_generated' THEN user_id END) as activated,
      COUNT(DISTINCT CASE 
        WHEN (SELECT COUNT(*) FROM recipe_metrics rm WHERE rm.user_id = ae.user_id AND rm.generated_at >= period_start) >= 3 
        THEN user_id 
      END) as engaged,
      COUNT(DISTINCT s.user_id) as paying
    FROM analytics_events ae
    LEFT JOIN subscriptions s ON s.user_id = ae.user_id 
      AND s.status = 'active'
      AND s.created_at BETWEEN period_start AND period_end
    WHERE ae.timestamp BETWEEN period_start AND period_end
  )
  SELECT 
    visitors,
    signups,
    ROUND(signups::NUMERIC / NULLIF(visitors, 0) * 100, 2) as signup_rate,
    activated,
    ROUND(activated::NUMERIC / NULLIF(signups, 0) * 100, 2) as activation_rate,
    engaged,
    ROUND(engaged::NUMERIC / NULLIF(activated, 0) * 100, 2) as engagement_rate,
    paying,
    ROUND(paying::NUMERIC / NULLIF(engaged, 0) * 100, 2) as conversion_rate
  FROM funnel_data;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SECTION 5: REVENUE METRICS (MRR/ARPU)
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_mrr()
RETURNS TABLE (
  mrr NUMERIC,
  paying_users BIGINT,
  arpu NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH revenue_data AS (
    SELECT 
      COUNT(DISTINCT user_id) as paying_users,
      SUM(CASE 
        WHEN plan = 'pro' THEN 9.99
        WHEN plan = 'premium' THEN 19.99
        ELSE 0
      END) as mrr
    FROM subscriptions
    WHERE status = 'active'
  )
  SELECT 
    mrr,
    paying_users,
    ROUND(mrr / NULLIF(paying_users, 0), 2) as arpu
  FROM revenue_data;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SECTION 6: UNIT ECONOMICS
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_unit_economics(
  period_start TIMESTAMPTZ DEFAULT CURRENT_DATE - INTERVAL '30 days',
  period_end TIMESTAMPTZ DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  total_revenue NUMERIC,
  total_costs NUMERIC,
  gross_profit NUMERIC,
  gross_margin_pct NUMERIC,
  avg_ltv NUMERIC,
  avg_months_active NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH revenue AS (
    SELECT SUM(CASE 
      WHEN plan = 'pro' THEN 9.99
      WHEN plan = 'premium' THEN 19.99
      ELSE 0
    END) as mrr
    FROM subscriptions
    WHERE status = 'active'
  ),
  costs AS (
    SELECT SUM(cost_usd) as total_ai_costs
    FROM usage_logs
    WHERE timestamp BETWEEN period_start AND period_end
  ),
  ltv_data AS (
    SELECT 
      AVG(total_revenue) as avg_ltv,
      AVG(EXTRACT(EPOCH FROM (last_payment - first_subscription)) / 2592000) as avg_months_active
    FROM (
      SELECT 
        user_id,
        SUM(CASE 
          WHEN plan = 'pro' THEN 9.99
          WHEN plan = 'premium' THEN 19.99
          ELSE 0
        END) as total_revenue,
        MIN(created_at) as first_subscription,
        MAX(current_period_end) as last_payment
      FROM subscriptions
      WHERE status = 'active'
      GROUP BY user_id
    ) user_revenue
  )
  SELECT 
    r.mrr as total_revenue,
    COALESCE(c.total_ai_costs, 0) as total_costs,
    r.mrr - COALESCE(c.total_ai_costs, 0) as gross_profit,
    ROUND((r.mrr - COALESCE(c.total_ai_costs, 0)) / NULLIF(r.mrr, 0) * 100, 2) as gross_margin_pct,
    COALESCE(l.avg_ltv, 0) as avg_ltv,
    COALESCE(l.avg_months_active, 0) as avg_months_active
  FROM revenue r, costs c, ltv_data l;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SECTION 7: CHANNEL ATTRIBUTION
-- ============================================================================

CREATE OR REPLACE FUNCTION get_channel_metrics(
  period_start TIMESTAMPTZ DEFAULT CURRENT_DATE - INTERVAL '30 days',
  period_end TIMESTAMPTZ DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  channel TEXT,
  signups BIGINT,
  activated BIGINT,
  paying BIGINT,
  activation_rate NUMERIC,
  conversion_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(p.metadata->>'utm_source', 'direct') as channel,
    COUNT(DISTINCT u.id) as signups,
    COUNT(DISTINCT CASE WHEN EXISTS (
      SELECT 1 FROM recipe_metrics rm WHERE rm.user_id = u.id
    ) THEN u.id END) as activated,
    COUNT(DISTINCT s.user_id) as paying,
    ROUND(
      COUNT(DISTINCT CASE WHEN EXISTS (
        SELECT 1 FROM recipe_metrics rm WHERE rm.user_id = u.id
      ) THEN u.id END)::NUMERIC / 
      NULLIF(COUNT(DISTINCT u.id), 0) * 100, 
      2
    ) as activation_rate,
    ROUND(
      COUNT(DISTINCT s.user_id)::NUMERIC / 
      NULLIF(COUNT(DISTINCT u.id), 0) * 100, 
      2
    ) as conversion_rate
  FROM auth.users u
  LEFT JOIN profiles p ON p.id = u.id
  LEFT JOIN subscriptions s ON s.user_id = u.id AND s.status = 'active'
  WHERE u.created_at BETWEEN period_start AND period_end
  GROUP BY COALESCE(p.metadata->>'utm_source', 'direct')
  ORDER BY signups DESC;
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON FUNCTION get_active_users IS 'Calculates DAU, WAU, MAU for a given period';
COMMENT ON FUNCTION calculate_activation_rate IS 'Calculates activation rate (% signups who generate first recipe within N days)';
COMMENT ON FUNCTION calculate_retention IS 'Calculates retention rate for a specific cohort';
COMMENT ON FUNCTION get_conversion_funnel IS 'Calculates conversion funnel metrics';
COMMENT ON FUNCTION calculate_mrr IS 'Calculates MRR and ARPU';
COMMENT ON FUNCTION calculate_unit_economics IS 'Calculates unit economics (revenue, costs, LTV, margins)';
COMMENT ON FUNCTION get_channel_metrics IS 'Calculates metrics by acquisition channel';
