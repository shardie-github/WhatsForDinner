-- Self-Healing SQL Pack: Core Tables, Functions, RLS
-- Idempotent: Safe to re-run, only creates missing objects
-- Generated: 2025-01-27

-- Extensions (IF NOT EXISTS)
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Core Tables (IF NOT EXISTS)

-- Events table: Application events (signups, activations, meal plans)
CREATE TABLE IF NOT EXISTS public.events (
    id BIGSERIAL PRIMARY KEY,
    event_name TEXT NOT NULL,
    event_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Spend table: Ads platform spend data
CREATE TABLE IF NOT EXISTS public.spend (
    id BIGSERIAL PRIMARY KEY,
    platform TEXT NOT NULL,
    date DATE NOT NULL,
    spend DECIMAL(10, 2) NOT NULL DEFAULT 0,
    impressions BIGINT DEFAULT 0,
    clicks BIGINT DEFAULT 0,
    conversions BIGINT DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(platform, date)
);

-- Metrics Daily table: Aggregated daily metrics
CREATE TABLE IF NOT EXISTS public.metrics_daily (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    mrr DECIMAL(10, 2) NOT NULL DEFAULT 0,
    active_users INTEGER NOT NULL DEFAULT 0,
    new_users INTEGER NOT NULL DEFAULT 0,
    activation_rate DECIMAL(5, 2) DEFAULT 0,
    retention_7d DECIMAL(5, 2) DEFAULT 0,
    retention_30d DECIMAL(5, 2) DEFAULT 0,
    cac DECIMAL(10, 2) DEFAULT 0,
    ltv DECIMAL(10, 2) DEFAULT 0,
    ltv_cac_ratio DECIMAL(5, 2) DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes (IF NOT EXISTS)

CREATE INDEX IF NOT EXISTS idx_events_name_time ON public.events(event_name, event_time DESC);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON public.events(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_spend_platform_dt ON public.spend(platform, date DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_day ON public.metrics_daily(date DESC);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spend ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics_daily ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Guarded: Only create if not exists)

DO $$
BEGIN
    -- Events: Basic SELECT policy (if no policies exist)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'events' 
        AND policyname = 'events_select_policy'
    ) THEN
        CREATE POLICY events_select_policy ON public.events
            FOR SELECT
            USING (true);
    END IF;

    -- Spend: Basic SELECT policy (if no policies exist)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'spend' 
        AND policyname = 'spend_select_policy'
    ) THEN
        CREATE POLICY spend_select_policy ON public.spend
            FOR SELECT
            USING (true);
    END IF;

    -- Metrics Daily: Basic SELECT policy (if no policies exist)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'metrics_daily' 
        AND policyname = 'metrics_daily_select_policy'
    ) THEN
        CREATE POLICY metrics_daily_select_policy ON public.metrics_daily
            FOR SELECT
            USING (true);
    END IF;
END $$;

-- Upsert Functions

-- Upsert Events: Idempotent event insertion
CREATE OR REPLACE FUNCTION public.upsert_events(event_data JSONB)
RETURNS TABLE(id BIGINT, event_name TEXT, event_time TIMESTAMPTZ)
LANGUAGE plpgsql
AS $$
DECLARE
    event_record RECORD;
BEGIN
    -- Insert event from JSONB
    INSERT INTO public.events (event_name, event_time, user_id, metadata)
    VALUES (
        event_data->>'event_name',
        COALESCE((event_data->>'event_time')::TIMESTAMPTZ, NOW()),
        event_data->>'user_id',
        COALESCE(event_data->'metadata', '{}'::jsonb)
    )
    RETURNING * INTO event_record;

    RETURN QUERY SELECT event_record.id, event_record.event_name, event_record.event_time;
END;
$$;

-- Upsert Spend: Idempotent spend insertion (upsert on platform + date)
CREATE OR REPLACE FUNCTION public.upsert_spend(spend_data JSONB)
RETURNS TABLE(id BIGINT, platform TEXT, date DATE, spend DECIMAL)
LANGUAGE plpgsql
AS $$
DECLARE
    spend_record RECORD;
BEGIN
    INSERT INTO public.spend (
        platform, date, spend, impressions, clicks, conversions, metadata
    )
    VALUES (
        spend_data->>'platform',
        (spend_data->>'date')::DATE,
        COALESCE((spend_data->>'spend')::DECIMAL(10, 2), 0),
        COALESCE((spend_data->>'impressions')::BIGINT, 0),
        COALESCE((spend_data->>'clicks')::BIGINT, 0),
        COALESCE((spend_data->>'conversions')::BIGINT, 0),
        COALESCE(spend_data->'metadata', '{}'::jsonb)
    )
    ON CONFLICT (platform, date) 
    DO UPDATE SET
        spend = EXCLUDED.spend,
        impressions = EXCLUDED.impressions,
        clicks = EXCLUDED.clicks,
        conversions = EXCLUDED.conversions,
        metadata = EXCLUDED.metadata,
        updated_at = NOW()
    RETURNING * INTO spend_record;

    RETURN QUERY SELECT spend_record.id, spend_record.platform, spend_record.date, spend_record.spend;
END;
$$;

-- Recompute Metrics Daily: Rollup function for date range
CREATE OR REPLACE FUNCTION public.recompute_metrics_daily(
    start_date DATE,
    end_date DATE
)
RETURNS TABLE(date DATE, mrr DECIMAL, active_users INTEGER, new_users INTEGER)
LANGUAGE plpgsql
AS $$
DECLARE
    day_record RECORD;
    computed_mrr DECIMAL(10, 2);
    computed_active_users INTEGER;
    computed_new_users INTEGER;
BEGIN
    -- Loop through date range
    FOR day_record IN 
        SELECT generate_series(start_date, end_date, '1 day'::INTERVAL)::DATE AS day
    LOOP
        -- Compute MRR (sum of subscription revenue for the month containing this day)
        SELECT COALESCE(SUM(spend), 0) INTO computed_mrr
        FROM public.spend
        WHERE platform = 'subscription'
        AND date >= date_trunc('month', day_record.day)
        AND date < date_trunc('month', day_record.day) + '1 month'::INTERVAL;

        -- Compute active users (users with events in last 30 days)
        SELECT COUNT(DISTINCT user_id) INTO computed_active_users
        FROM public.events
        WHERE event_time >= day_record.day - INTERVAL '30 days'
        AND event_time < day_record.day + INTERVAL '1 day'
        AND user_id IS NOT NULL;

        -- Compute new users (users with first event on this day)
        SELECT COUNT(DISTINCT user_id) INTO computed_new_users
        FROM public.events
        WHERE event_name = 'signup'
        AND DATE(event_time) = day_record.day
        AND user_id IS NOT NULL;

        -- Upsert metrics_daily
        INSERT INTO public.metrics_daily (
            date, mrr, active_users, new_users, updated_at
        )
        VALUES (
            day_record.day,
            computed_mrr,
            computed_active_users,
            computed_new_users,
            NOW()
        )
        ON CONFLICT (date) 
        DO UPDATE SET
            mrr = EXCLUDED.mrr,
            active_users = EXCLUDED.active_users,
            new_users = EXCLUDED.new_users,
            updated_at = NOW();

        RETURN QUERY SELECT day_record.day, computed_mrr, computed_active_users, computed_new_users;
    END LOOP;
END;
$$;

-- System Healthcheck: Returns system health status as JSONB
CREATE OR REPLACE FUNCTION public.system_healthcheck()
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    health_status JSONB;
    events_count BIGINT;
    spend_count BIGINT;
    metrics_count BIGINT;
    latest_event_time TIMESTAMPTZ;
    latest_spend_date DATE;
    latest_metrics_date DATE;
BEGIN
    -- Get counts
    SELECT COUNT(*) INTO events_count FROM public.events;
    SELECT COUNT(*) INTO spend_count FROM public.spend;
    SELECT COUNT(*) INTO metrics_count FROM public.metrics_daily;

    -- Get latest timestamps
    SELECT MAX(event_time) INTO latest_event_time FROM public.events;
    SELECT MAX(date) INTO latest_spend_date FROM public.spend;
    SELECT MAX(date) INTO latest_metrics_date FROM public.metrics_daily;

    -- Build health status
    health_status := jsonb_build_object(
        'status', 'healthy',
        'timestamp', NOW(),
        'tables', jsonb_build_object(
            'events', jsonb_build_object(
                'count', events_count,
                'latest', latest_event_time
            ),
            'spend', jsonb_build_object(
                'count', spend_count,
                'latest', latest_spend_date
            ),
            'metrics_daily', jsonb_build_object(
                'count', metrics_count,
                'latest', latest_metrics_date
            )
        ),
        'checks', jsonb_build_object(
            'events_fresh', CASE WHEN latest_event_time > NOW() - INTERVAL '24 hours' THEN true ELSE false END,
            'spend_fresh', CASE WHEN latest_spend_date >= CURRENT_DATE - INTERVAL '1 day' THEN true ELSE false END,
            'metrics_fresh', CASE WHEN latest_metrics_date >= CURRENT_DATE - INTERVAL '1 day' THEN true ELSE false END
        )
    );

    RETURN health_status;
END;
$$;

-- Grant permissions (if needed)
GRANT SELECT ON public.events TO authenticated;
GRANT SELECT ON public.spend TO authenticated;
GRANT SELECT ON public.metrics_daily TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_events(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_spend(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.recompute_metrics_daily(DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.system_healthcheck() TO authenticated;
