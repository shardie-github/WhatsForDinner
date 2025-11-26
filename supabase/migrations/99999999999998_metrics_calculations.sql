-- ============================================================================
-- METRICS CALCULATION FUNCTIONS
-- ============================================================================
-- Functions to calculate key metrics for YC application and investor meetings
-- Date: 2025-01-28
-- ============================================================================

-- Function: Get Active Users (DAU/WAU/MAU)
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
    date_trunc('day', e.ts)::DATE as date,
    COUNT(DISTINCT e.user_id) FILTER (
      WHERE e.ts >= date_trunc('day', CURRENT_DATE)
    ) as dau,
    COUNT(DISTINCT e.user_id) FILTER (
      WHERE e.ts >= CURRENT_DATE - INTERVAL '7 days'
    ) as wau,
    COUNT(DISTINCT e.user_id) FILTER (
      WHERE e.ts >= CURRENT_DATE - INTERVAL '30 days'
    ) as mau
  FROM events e
  WHERE e.ts BETWEEN period_start AND period_end
    AND e.user_id IS NOT NULL
  GROUP BY date_trunc('day', e.ts)::DATE
  ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql;

-- Function: Get Activation Rate
CREATE OR REPLACE FUNCTION get_activation_rate()
RETURNS TABLE (
  total_signups BIGINT,
  activated_users BIGINT,
  activation_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH signups AS (
    SELECT DISTINCT user_id, MIN(created_at) as signup_date
    FROM users
    GROUP BY user_id
  ),
  first_recipe AS (
    SELECT DISTINCT user_id, MIN(created_at) as first_recipe_date
    FROM recipes
    WHERE user_id IS NOT NULL
    GROUP BY user_id
  ),
  activated AS (
    SELECT s.user_id
    FROM signups s
    INNER JOIN first_recipe fr ON s.user_id = fr.user_id
    WHERE fr.first_recipe_date <= s.signup_date + INTERVAL '7 days'
  )
  SELECT 
    (SELECT COUNT(*) FROM signups)::BIGINT as total_signups,
    (SELECT COUNT(*) FROM activated)::BIGINT as activated_users,
    CASE 
      WHEN (SELECT COUNT(*) FROM signups) > 0 THEN
        (SELECT COUNT(*)::NUMERIC FROM activated) / (SELECT COUNT(*)::NUMERIC FROM signups) * 100
      ELSE 0
    END as activation_rate;
END;
$$ LANGUAGE plpgsql;

-- Function: Get Retention Rate
CREATE OR REPLACE FUNCTION get_retention_rate(
  cohort_start DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  cohort_end DATE DEFAULT CURRENT_DATE - INTERVAL '23 days'
)
RETURNS TABLE (
  cohort_date DATE,
  signups BIGINT,
  retained_7d BIGINT,
  retention_7d NUMERIC,
  retained_30d BIGINT,
  retention_30d NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH cohort_users AS (
    SELECT DISTINCT user_id, MIN(created_at)::DATE as signup_date
    FROM users
    WHERE created_at::DATE BETWEEN cohort_start AND cohort_end
    GROUP BY user_id
  ),
  active_7d AS (
    SELECT DISTINCT e.user_id
    FROM events e
    INNER JOIN cohort_users c ON e.user_id = c.user_id
    WHERE e.ts >= c.signup_date + INTERVAL '7 days'
      AND e.ts < c.signup_date + INTERVAL '14 days'
  ),
  active_30d AS (
    SELECT DISTINCT e.user_id
    FROM events e
    INNER JOIN cohort_users c ON e.user_id = c.user_id
    WHERE e.ts >= c.signup_date + INTERVAL '30 days'
      AND e.ts < c.signup_date + INTERVAL '37 days'
  )
  SELECT 
    cohort_start as cohort_date,
    (SELECT COUNT(*) FROM cohort_users)::BIGINT as signups,
    (SELECT COUNT(*) FROM active_7d)::BIGINT as retained_7d,
    CASE 
      WHEN (SELECT COUNT(*) FROM cohort_users) > 0 THEN
        (SELECT COUNT(*)::NUMERIC FROM active_7d) / (SELECT COUNT(*)::NUMERIC FROM cohort_users) * 100
      ELSE 0
    END as retention_7d,
    (SELECT COUNT(*) FROM active_30d)::BIGINT as retained_30d,
    CASE 
      WHEN (SELECT COUNT(*) FROM cohort_users) > 0 THEN
        (SELECT COUNT(*)::NUMERIC FROM active_30d) / (SELECT COUNT(*)::NUMERIC FROM cohort_users) * 100
      ELSE 0
    END as retention_30d;
END;
$$ LANGUAGE plpgsql;

-- Function: Get Revenue Metrics (MRR, ARPU)
CREATE OR REPLACE FUNCTION get_revenue_metrics()
RETURNS TABLE (
  mrr NUMERIC,
  paying_users BIGINT,
  arpu NUMERIC,
  total_revenue NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH active_subscriptions AS (
    SELECT 
      u.id,
      CASE 
        WHEN u.plan = 'premium' THEN 19.99
        WHEN u.plan = 'partner' THEN 9.99
        ELSE 0
      END as monthly_price
    FROM users u
    WHERE u.plan IN ('premium', 'partner')
  )
  SELECT 
    COALESCE(SUM(monthly_price), 0) as mrr,
    COUNT(*)::BIGINT as paying_users,
    CASE 
      WHEN COUNT(*) > 0 THEN COALESCE(SUM(monthly_price), 0) / COUNT(*)::NUMERIC
      ELSE 0
    END as arpu,
    COALESCE(SUM(monthly_price), 0) as total_revenue
  FROM active_subscriptions;
END;
$$ LANGUAGE plpgsql;

-- Function: Get Conversion Funnel
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
  WITH visitors AS (
    SELECT COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NULL) + 
           COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) as total
    FROM events
    WHERE ts BETWEEN period_start AND period_end
  ),
  signups AS (
    SELECT COUNT(*) as total
    FROM users
    WHERE created_at BETWEEN period_start AND period_end
  ),
  activated AS (
    SELECT COUNT(DISTINCT r.user_id) as total
    FROM recipes r
    INNER JOIN users u ON r.user_id = u.id
    WHERE r.created_at BETWEEN period_start AND period_end
      AND r.created_at <= u.created_at + INTERVAL '7 days'
  ),
  engaged AS (
    SELECT COUNT(DISTINCT user_id) as total
    FROM (
      SELECT user_id, COUNT(*) as recipe_count
      FROM recipes
      WHERE created_at BETWEEN period_start AND period_end
        AND user_id IS NOT NULL
      GROUP BY user_id
      HAVING COUNT(*) >= 3
    ) e
  ),
  paying AS (
    SELECT COUNT(*) as total
    FROM users
    WHERE plan IN ('premium', 'partner')
      AND created_at BETWEEN period_start AND period_end
  )
  SELECT 
    (SELECT total FROM visitors)::BIGINT as visitors,
    (SELECT total FROM signups)::BIGINT as signups,
    CASE 
      WHEN (SELECT total FROM visitors) > 0 THEN
        (SELECT total::NUMERIC FROM signups) / (SELECT total::NUMERIC FROM visitors) * 100
      ELSE 0
    END as signup_rate,
    (SELECT total FROM activated)::BIGINT as activated,
    CASE 
      WHEN (SELECT total FROM signups) > 0 THEN
        (SELECT total::NUMERIC FROM activated) / (SELECT total::NUMERIC FROM signups) * 100
      ELSE 0
    END as activation_rate,
    (SELECT total FROM engaged)::BIGINT as engaged,
    CASE 
      WHEN (SELECT total FROM signups) > 0 THEN
        (SELECT total::NUMERIC FROM engaged) / (SELECT total::NUMERIC FROM signups) * 100
      ELSE 0
    END as engagement_rate,
    (SELECT total FROM paying)::BIGINT as paying,
    CASE 
      WHEN (SELECT total FROM signups) > 0 THEN
        (SELECT total::NUMERIC FROM paying) / (SELECT total::NUMERIC FROM signups) * 100
      ELSE 0
    END as conversion_rate;
END;
$$ LANGUAGE plpgsql;

-- Function: Get Unit Economics
CREATE OR REPLACE FUNCTION get_unit_economics()
RETURNS TABLE (
  total_revenue NUMERIC,
  total_costs NUMERIC,
  gross_profit NUMERIC,
  gross_margin_pct NUMERIC,
  avg_ltv NUMERIC,
  avg_months_active NUMERIC,
  estimated_cac NUMERIC,
  ltv_cac_ratio NUMERIC,
  payback_period_months NUMERIC
) AS $$
DECLARE
  v_mrr NUMERIC;
  v_arpu NUMERIC;
  v_paying_users BIGINT;
  v_infrastructure_costs NUMERIC := 50; -- Estimated monthly infrastructure costs
  v_ai_costs NUMERIC := 0; -- Will be calculated from usage_logs if exists
  v_gross_margin NUMERIC := 0.85; -- 85% gross margin assumption
BEGIN
  -- Get revenue metrics
  SELECT mrr, paying_users, arpu INTO v_mrr, v_paying_users, v_arpu
  FROM get_revenue_metrics();
  
  -- Calculate costs (simplified - should track actual costs)
  v_total_costs := v_infrastructure_costs + v_ai_costs;
  
  -- Calculate LTV (simplified: ARPU * average months active)
  -- Assuming average user stays 12 months (should calculate from actual data)
  v_avg_months_active := 12.0;
  v_avg_ltv := COALESCE(v_arpu, 0) * v_avg_months_active * v_gross_margin;
  
  -- Estimate CAC (if no paid acquisition, assume $0 for organic)
  v_estimated_cac := 0; -- Should be calculated from actual ad spend
  
  -- Calculate ratios
  v_ltv_cac_ratio := CASE 
    WHEN v_estimated_cac > 0 THEN v_avg_ltv / v_estimated_cac
    ELSE NULL
  END;
  
  v_payback_period_months := CASE 
    WHEN v_arpu > 0 AND v_gross_margin > 0 THEN v_estimated_cac / (v_arpu * v_gross_margin)
    ELSE NULL
  END;
  
  RETURN QUERY
  SELECT 
    COALESCE(v_mrr, 0) as total_revenue,
    v_total_costs as total_costs,
    COALESCE(v_mrr, 0) - v_total_costs as gross_profit,
    CASE 
      WHEN COALESCE(v_mrr, 0) > 0 THEN 
        ((COALESCE(v_mrr, 0) - v_total_costs) / COALESCE(v_mrr, 0)) * 100
      ELSE 0
    END as gross_margin_pct,
    v_avg_ltv as avg_ltv,
    v_avg_months_active as avg_months_active,
    v_estimated_cac as estimated_cac,
    v_ltv_cac_ratio as ltv_cac_ratio,
    v_payback_period_months as payback_period_months;
END;
$$ LANGUAGE plpgsql;

-- Function: Get Channel Metrics
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
  WITH channel_signups AS (
    SELECT 
      COALESCE(e.props->>'source', 'organic') as channel,
      COUNT(DISTINCT u.id) as signups
    FROM users u
    LEFT JOIN events e ON e.user_id = u.id AND e.name = 'user_signed_up'
    WHERE u.created_at BETWEEN period_start AND period_end
    GROUP BY COALESCE(e.props->>'source', 'organic')
  ),
  channel_activated AS (
    SELECT 
      COALESCE(e.props->>'source', 'organic') as channel,
      COUNT(DISTINCT r.user_id) as activated
    FROM recipes r
    INNER JOIN users u ON r.user_id = u.id
    LEFT JOIN events e ON e.user_id = u.id AND e.name = 'user_signed_up'
    WHERE r.created_at BETWEEN period_start AND period_end
      AND r.created_at <= u.created_at + INTERVAL '7 days'
    GROUP BY COALESCE(e.props->>'source', 'organic')
  ),
  channel_paying AS (
    SELECT 
      COALESCE(e.props->>'source', 'organic') as channel,
      COUNT(DISTINCT u.id) as paying
    FROM users u
    LEFT JOIN events e ON e.user_id = u.id AND e.name = 'user_signed_up'
    WHERE u.plan IN ('premium', 'partner')
      AND u.created_at BETWEEN period_start AND period_end
    GROUP BY COALESCE(e.props->>'source', 'organic')
  )
  SELECT 
    cs.channel,
    cs.signups,
    COALESCE(ca.activated, 0)::BIGINT as activated,
    COALESCE(cp.paying, 0)::BIGINT as paying,
    CASE 
      WHEN cs.signups > 0 THEN (COALESCE(ca.activated, 0)::NUMERIC / cs.signups::NUMERIC) * 100
      ELSE 0
    END as activation_rate,
    CASE 
      WHEN cs.signups > 0 THEN (COALESCE(cp.paying, 0)::NUMERIC / cs.signups::NUMERIC) * 100
      ELSE 0
    END as conversion_rate
  FROM channel_signups cs
  LEFT JOIN channel_activated ca ON cs.channel = ca.channel
  LEFT JOIN channel_paying cp ON cs.channel = cp.channel
  ORDER BY cs.signups DESC;
END;
$$ LANGUAGE plpgsql;
