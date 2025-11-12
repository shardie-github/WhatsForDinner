#!/usr/bin/env tsx
/**
 * ETL Script: Compute Daily Metrics
 * 
 * Aggregates events, orders, and spend data into daily metrics table.
 * Computes: sessions, add_to_carts, orders, revenue, refunds, AOV, CAC, conversion_rate
 * 
 * Usage:
 *   tsx scripts/etl/compute_metrics.ts
 *   tsx scripts/etl/compute_metrics.ts --cron  # Run in cron mode
 *   tsx scripts/etl/compute_metrics.ts --day 2025-01-27  # Compute for specific day
 */

import pg from 'pg';

const { Pool } = pg;

interface DailyMetrics {
  day: string;
  sessions: number;
  add_to_carts: number;
  orders: number;
  revenue_cents: number;
  refunds_cents: number;
  aov_cents: number;
  cac_cents: number;
  conversion_rate: number;
  gross_margin_cents: number;
  traffic: number;
}

async function computeDailyMetrics(
  dbUrl: string,
  targetDay?: string
): Promise<DailyMetrics[]> {
  const pool = new Pool({ connectionString: dbUrl });

  try {
    // Determine date range
    let dateFilter = '';
    if (targetDay) {
      dateFilter = `WHERE day = '${targetDay}'`;
    } else {
      // Default to last 7 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      dateFilter = `WHERE day >= '${startDate.toISOString().split('T')[0]}' AND day <= '${endDate.toISOString().split('T')[0]}'`;
    }

    // Compute metrics from events, orders, and spend
    const query = `
      WITH daily_events AS (
        SELECT 
          DATE(occurred_at) as day,
          COUNT(DISTINCT CASE WHEN event_name = 'session_start' THEN user_id END) as sessions,
          COUNT(CASE WHEN event_name = 'add_to_cart' THEN 1 END) as add_to_carts,
          COUNT(DISTINCT CASE WHEN event_name = 'session_start' THEN user_id END) as traffic
        FROM public.events
        ${dateFilter.replace('day', 'DATE(occurred_at)')}
        GROUP BY DATE(occurred_at)
      ),
      daily_orders AS (
        SELECT 
          DATE(placed_at) as day,
          COUNT(*) as orders,
          SUM(total_cents) as revenue_cents,
          SUM(CASE WHEN total_cents < 0 THEN ABS(total_cents) ELSE 0 END) as refunds_cents,
          AVG(total_cents) as aov_cents
        FROM public.orders
        ${dateFilter.replace('day', 'DATE(placed_at)')}
        GROUP BY DATE(placed_at)
      ),
      daily_spend AS (
        SELECT 
          date as day,
          SUM(spend_cents) as spend_cents,
          SUM(clicks) as clicks
        FROM public.spend
        ${dateFilter}
        GROUP BY date
      ),
      combined AS (
        SELECT 
          COALESCE(e.day, o.day, s.day) as day,
          COALESCE(e.sessions, 0) as sessions,
          COALESCE(e.add_to_carts, 0) as add_to_carts,
          COALESCE(e.traffic, 0) as traffic,
          COALESCE(o.orders, 0) as orders,
          COALESCE(o.revenue_cents, 0) as revenue_cents,
          COALESCE(o.refunds_cents, 0) as refunds_cents,
          COALESCE(o.aov_cents, 0) as aov_cents,
          COALESCE(s.spend_cents, 0) as spend_cents,
          COALESCE(s.clicks, 0) as clicks
        FROM daily_events e
        FULL OUTER JOIN daily_orders o ON e.day = o.day
        FULL OUTER JOIN daily_spend s ON COALESCE(e.day, o.day) = s.day
      )
      SELECT 
        day,
        sessions,
        add_to_carts,
        traffic,
        orders,
        revenue_cents,
        refunds_cents,
        aov_cents,
        CASE 
          WHEN orders > 0 THEN spend_cents / orders 
          ELSE 0 
        END as cac_cents,
        CASE 
          WHEN sessions > 0 THEN (orders::numeric / sessions) * 100 
          ELSE 0 
        END as conversion_rate,
        revenue_cents - (revenue_cents * 0.14) as gross_margin_cents  -- Assuming 14% COGS
      FROM combined
      ORDER BY day DESC
    `;

    const result = await pool.query(query);
    return result.rows.map((row) => ({
      day: row.day,
      sessions: parseInt(row.sessions || '0', 10),
      add_to_carts: parseInt(row.add_to_carts || '0', 10),
      orders: parseInt(row.orders || '0', 10),
      revenue_cents: parseInt(row.revenue_cents || '0', 10),
      refunds_cents: parseInt(row.refunds_cents || '0', 10),
      aov_cents: parseInt(row.aov_cents || '0', 10),
      cac_cents: parseInt(row.cac_cents || '0', 10),
      conversion_rate: parseFloat(row.conversion_rate || '0'),
      gross_margin_cents: parseInt(row.gross_margin_cents || '0', 10),
      traffic: parseInt(row.traffic || '0', 10),
    }));
  } finally {
    await pool.end();
  }
}

async function storeMetrics(dbUrl: string, metrics: DailyMetrics[]): Promise<void> {
  const pool = new Pool({ connectionString: dbUrl });

  try {
    for (const metric of metrics) {
      await pool.query(
        `INSERT INTO public.metrics_daily (
          day, sessions, add_to_carts, orders, revenue_cents, refunds_cents,
          aov_cents, cac_cents, conversion_rate, gross_margin_cents, traffic
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (day) 
        DO UPDATE SET
          sessions = EXCLUDED.sessions,
          add_to_carts = EXCLUDED.add_to_carts,
          orders = EXCLUDED.orders,
          revenue_cents = EXCLUDED.revenue_cents,
          refunds_cents = EXCLUDED.refunds_cents,
          aov_cents = EXCLUDED.aov_cents,
          cac_cents = EXCLUDED.cac_cents,
          conversion_rate = EXCLUDED.conversion_rate,
          gross_margin_cents = EXCLUDED.gross_margin_cents,
          traffic = EXCLUDED.traffic`,
        [
          metric.day,
          metric.sessions,
          metric.add_to_carts,
          metric.orders,
          metric.revenue_cents,
          metric.refunds_cents,
          metric.aov_cents,
          metric.cac_cents,
          metric.conversion_rate,
          metric.gross_margin_cents,
          metric.traffic,
        ]
      );
    }
  } finally {
    await pool.end();
  }
}

async function main() {
  const isCron = process.argv.includes('--cron');
  const dayIndex = process.argv.indexOf('--day');
  const targetDay = dayIndex > -1 ? process.argv[dayIndex + 1] : undefined;

  const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

  if (!dbUrl) {
    throw new Error('Missing required env var: SUPABASE_DB_URL or DATABASE_URL');
  }

  if (!isCron) {
    console.log(`Computing daily metrics${targetDay ? ` for ${targetDay}` : ' (last 7 days)'}...`);
  }

  try {
    const metrics = await computeDailyMetrics(dbUrl, targetDay);

    if (metrics.length === 0) {
      if (!isCron) {
        console.log('No metrics computed (no data found).');
      }
      return;
    }

    await storeMetrics(dbUrl, metrics);

    if (!isCron) {
      console.log(`✅ Stored metrics for ${metrics.length} day(s)`);
      console.log('Sample metrics:', JSON.stringify(metrics[0], null, 2));
    }
  } catch (error) {
    console.error('Error computing metrics:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { computeDailyMetrics, storeMetrics };
