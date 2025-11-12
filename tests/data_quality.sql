-- Data Quality Checks
-- Template SQL queries for data quality validation
-- Run via: psql $SUPABASE_DB_URL -f tests/data_quality.sql

-- Check 1: NOT NULL constraints
SELECT 
    'events.event_name' as check_name,
    COUNT(*) as violations
FROM public.events
WHERE event_name IS NULL;

SELECT 
    'spend.platform' as check_name,
    COUNT(*) as violations
FROM public.spend
WHERE platform IS NULL;

SELECT 
    'spend.date' as check_name,
    COUNT(*) as violations
FROM public.spend
WHERE date IS NULL;

SELECT 
    'metrics_daily.date' as check_name,
    COUNT(*) as violations
FROM public.metrics_daily
WHERE date IS NULL;

-- Check 2: Data Freshness (events should be < 24h old)
SELECT 
    'events_freshness' as check_name,
    MAX(event_time) as latest_event,
    NOW() - MAX(event_time) as age,
    CASE 
        WHEN NOW() - MAX(event_time) < INTERVAL '24 hours' THEN 'PASS'
        ELSE 'FAIL'
    END as status
FROM public.events;

-- Check 3: Data Freshness (spend should be < 24h old)
SELECT 
    'spend_freshness' as check_name,
    MAX(date) as latest_spend,
    CURRENT_DATE - MAX(date) as days_old,
    CASE 
        WHEN CURRENT_DATE - MAX(date) <= 1 THEN 'PASS'
        ELSE 'FAIL'
    END as status
FROM public.spend;

-- Check 4: Data Freshness (metrics should be < 24h old)
SELECT 
    'metrics_freshness' as check_name,
    MAX(date) as latest_metrics,
    CURRENT_DATE - MAX(date) as days_old,
    CASE 
        WHEN CURRENT_DATE - MAX(date) <= 1 THEN 'PASS'
        ELSE 'FAIL'
    END as status
FROM public.metrics_daily;

-- Check 5: Duplicates (spend: platform + date should be unique)
SELECT 
    'spend_duplicates' as check_name,
    platform,
    date,
    COUNT(*) as count
FROM public.spend
GROUP BY platform, date
HAVING COUNT(*) > 1;

-- Check 6: Duplicates (metrics_daily: date should be unique)
SELECT 
    'metrics_duplicates' as check_name,
    date,
    COUNT(*) as count
FROM public.metrics_daily
GROUP BY date
HAVING COUNT(*) > 1;

-- Check 7: Completeness (spend: required fields)
SELECT 
    'spend_completeness' as check_name,
    COUNT(*) as total_rows,
    COUNT(platform) as platform_count,
    COUNT(date) as date_count,
    COUNT(spend) as spend_count,
    ROUND(100.0 * COUNT(spend) / NULLIF(COUNT(*), 0), 2) as completeness_pct
FROM public.spend;

-- Check 8: Completeness (metrics_daily: required fields)
SELECT 
    'metrics_completeness' as check_name,
    COUNT(*) as total_rows,
    COUNT(date) as date_count,
    COUNT(mrr) as mrr_count,
    COUNT(active_users) as active_users_count,
    ROUND(100.0 * COUNT(mrr) / NULLIF(COUNT(*), 0), 2) as completeness_pct
FROM public.metrics_daily;

-- Summary: All checks
SELECT 'SUMMARY' as check_type, COUNT(*) as total_checks FROM (
    SELECT 1 FROM public.events WHERE event_name IS NULL
    UNION ALL
    SELECT 1 FROM public.spend WHERE platform IS NULL OR date IS NULL
    UNION ALL
    SELECT 1 FROM public.metrics_daily WHERE date IS NULL
) as all_checks;
